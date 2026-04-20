"""Сервіс казино — рулетка, слоти, профіль."""
from __future__ import annotations

import random
import secrets
import time
from typing import Any

from ..repositories.casino_repository import CasinoRepository

# ── Roulette constants ────────────────────────────────────────────────────────

_RED_NUMBERS = {1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36}
_BLACK_NUMBERS = {2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35}

_ROULETTE_PAYOUTS: dict[str, int] = {
    'straight':  35,   # одне число
    'split':     17,   # два числа
    'street':    11,   # три числа
    'corner':     8,   # чотири числа
    'line':       5,   # шість чисел
    'dozen':      2,   # 1-12 / 13-24 / 25-36
    'column':     2,   # колонки
    'red':        1,   # червоне
    'black':      1,   # чорне
    'even':       1,   # парне
    'odd':        1,   # непарне
    'low':        1,   # 1-18
    'high':       1,   # 19-36
}

# ── Slots constants ───────────────────────────────────────────────────────────

_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '7️⃣']
_SYMBOL_WEIGHTS = [30, 25, 20, 15, 5, 3, 2]   # більший вага = частіше

_SLOTS_PAYOUTS = {
    ('7️⃣', '7️⃣', '7️⃣'): 50,
    ('💎', '💎', '💎'): 25,
    ('⭐', '⭐', '⭐'): 15,
    ('🍇', '🍇', '🍇'): 10,
    ('🍊', '🍊', '🍊'):  8,
    ('🍋', '🍋', '🍋'):  5,
    ('🍒', '🍒', '🍒'):  3,
}


# ── In-memory game sessions (prod: Redis) ────────────────────────────────────
_crash_sessions: dict[str, dict] = {}
_mines_sessions: dict[str, dict] = {}
_chicken_sessions: dict[str, dict] = {}


def _cleanup_old_sessions(store: dict, max_age: float = 300.0) -> None:
    now = time.time()
    stale = [k for k, v in store.items() if now - v.get('started_at', now) > max_age]
    for k in stale:
        store.pop(k, None)


class CasinoService:
    MIN_BET = 1.0
    MAX_BET = 10_000.0

    def __init__(self) -> None:
        self.repo = CasinoRepository()

    # ── Wallet ────────────────────────────────────────────────────────────────

    def get_profile(self, user_id: int) -> dict:
        wallet = self.repo.ensure_wallet(user_id)
        history = self.repo.list_history(user_id, limit=10)
        achievements = self.repo.list_achievements(user_id)
        return {
            'wallet': wallet,
            'recent_games': history,
            'achievements': achievements,
        }

    def get_leaderboard(self) -> list[dict]:
        return self.repo.get_leaderboard(10)

    # ── Roulette ──────────────────────────────────────────────────────────────

    def spin_roulette(self, user_id: int, bets: list[dict]) -> dict:
        """
        bets = [{'type': 'red', 'amount': 100}, {'type': 'straight', 'numbers': [7], 'amount': 50}, ...]
        """
        wallet = self.repo.ensure_wallet(user_id)
        total_bet = sum(float(b.get('amount', 0)) for b in bets)

        self._validate_bet(total_bet, wallet['balance'])

        # Spin
        result_number = random.randint(0, 36)
        color = (
            'green' if result_number == 0
            else 'red' if result_number in _RED_NUMBERS
            else 'black'
        )

        # Calculate winnings
        total_win = 0.0
        bet_details = []
        for bet in bets:
            bet_type = (bet.get('type') or '').strip()
            amount   = float(bet.get('amount', 0))
            numbers  = bet.get('numbers') or []
            won, payout_mult = self._calc_roulette_bet(bet_type, numbers, result_number, color, amount)
            total_win += won
            bet_details.append({
                'type': bet_type,
                'amount': amount,
                'won': won,
                'payout': payout_mult,
            })

        net = total_win - total_bet
        self.repo.update_balance(user_id, net)
        self.repo.add_bet_stats(user_id, total_bet, total_win)
        xp = max(1, int(total_bet / 10))
        self.repo.add_xp(user_id, xp)
        self.repo.save_game(user_id, 'roulette', total_bet, total_win, {
            'number': result_number, 'color': color, 'bets': bet_details,
        })
        if total_win > 0:
            self.repo.upsert_leaderboard(user_id, total_win)

        self._check_roulette_achievements(user_id, result_number, total_win, total_bet)

        new_balance = wallet['balance'] + net
        return {
            'number': result_number,
            'color': color,
            'total_bet': total_bet,
            'total_win': total_win,
            'net': net,
            'new_balance': new_balance,
            'bets': bet_details,
            'xp_gained': xp,
        }

    def _calc_roulette_bet(
        self, bet_type: str, numbers: list, result: int, color: str, amount: float
    ) -> tuple[float, int]:
        mult = _ROULETTE_PAYOUTS.get(bet_type, 0)
        won  = False
        if bet_type == 'straight':
            won = result in [int(n) for n in numbers]
        elif bet_type == 'split':
            won = result in [int(n) for n in numbers[:2]]
        elif bet_type == 'street':
            won = result in [int(n) for n in numbers[:3]]
        elif bet_type == 'corner':
            won = result in [int(n) for n in numbers[:4]]
        elif bet_type == 'line':
            won = result in [int(n) for n in numbers[:6]]
        elif bet_type == 'dozen':
            d = int((numbers[0] if numbers else 1))
            if d == 1:   won = 1 <= result <= 12
            elif d == 2: won = 13 <= result <= 24
            else:        won = 25 <= result <= 36
        elif bet_type == 'column':
            col = int((numbers[0] if numbers else 1))
            won = result > 0 and (result % 3) == (col % 3)
        elif bet_type == 'red':   won = color == 'red'
        elif bet_type == 'black': won = color == 'black'
        elif bet_type == 'even':  won = result > 0 and result % 2 == 0
        elif bet_type == 'odd':   won = result > 0 and result % 2 == 1
        elif bet_type == 'low':   won = 1 <= result <= 18
        elif bet_type == 'high':  won = 19 <= result <= 36

        payout = (mult + 1) * amount if won else 0.0
        return payout, mult

    # ── Slots ─────────────────────────────────────────────────────────────────

    def spin_slots(self, user_id: int, bet: float) -> dict:
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])

        reels = [
            random.choices(_SYMBOLS, weights=_SYMBOL_WEIGHTS, k=3),
            random.choices(_SYMBOLS, weights=_SYMBOL_WEIGHTS, k=3),
            random.choices(_SYMBOLS, weights=_SYMBOL_WEIGHTS, k=3),
        ]

        # Centre payline
        line = (reels[0][1], reels[1][1], reels[2][1])
        mult = _SLOTS_PAYOUTS.get(line, 0)
        if mult == 0 and line[0] == line[1]:
            mult = 1  # two-of-a-kind consolation
        win = bet * mult

        net = win - bet
        self.repo.update_balance(user_id, net)
        self.repo.add_bet_stats(user_id, bet, win)
        xp = max(1, int(bet / 20))
        self.repo.add_xp(user_id, xp)
        self.repo.save_game(user_id, 'slots', bet, win, {
            'reels': reels, 'line': list(line), 'multiplier': mult,
        })
        if win > 0:
            self.repo.upsert_leaderboard(user_id, win)

        self._check_slots_achievements(user_id, line, win, bet)

        return {
            'reels': reels,
            'line': list(line),
            'multiplier': mult,
            'bet': bet,
            'win': win,
            'net': net,
            'new_balance': wallet['balance'] + net,
            'xp_gained': xp,
        }

    # ── Crash ─────────────────────────────────────────────────────────────────

    def start_crash(self, user_id: int, bet: float) -> dict:
        _cleanup_old_sessions(_crash_sessions)
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])

        r = random.random()
        crash_at = 1.00 if r < 0.05 else round(max(1.01, 1 / (1 - random.random() * 0.96)), 2)

        session_id = secrets.token_hex(16)
        _crash_sessions[session_id] = {
            'user_id': user_id, 'bet': bet, 'crash_at': crash_at,
            'status': 'running', 'started_at': time.time(),
        }
        new_balance = self.repo.update_balance(user_id, -bet)
        self.repo.add_xp(user_id, max(1, int(bet / 20)))
        return {'session_id': session_id, 'new_balance': new_balance}

    def cashout_crash(self, user_id: int, session_id: str, mult: float) -> dict:
        sess = _crash_sessions.get(session_id)
        if not sess:
            raise ValueError('Сесія не знайдена.')
        if sess['user_id'] != user_id:
            raise ValueError('Доступ заборонено.')
        if sess['status'] != 'running':
            raise ValueError('Гра вже завершена.')

        crash_at = sess['crash_at']
        bet = sess['bet']
        elapsed = time.time() - sess['started_at']
        max_mult = round(1.04 ** (elapsed * 10 + 3), 2)
        mult = min(mult, max_mult)

        crashed = mult >= crash_at
        cashed_at = crash_at if crashed else round(mult, 2)
        win = 0.0 if crashed else round(bet * cashed_at, 2)

        if win > 0:
            new_balance = self.repo.update_balance(user_id, win)
            self.repo.add_bet_stats(user_id, bet, win)
            self.repo.upsert_leaderboard(user_id, win)
        else:
            new_balance = self.repo.ensure_wallet(user_id)['balance']
            self.repo.add_bet_stats(user_id, bet, 0)

        self.repo.save_game(user_id, 'crash', bet, win, {
            'crash_at': crash_at, 'cashed_at': cashed_at, 'crashed': crashed,
        })
        _crash_sessions.pop(session_id, None)
        return {
            'crashed': crashed, 'crash_at': crash_at, 'cashed_at': cashed_at,
            'win': win, 'bet': bet, 'net': win - bet, 'new_balance': new_balance,
        }

    # ── Mines ─────────────────────────────────────────────────────────────────

    MINES_GRID = 25

    def start_mines(self, user_id: int, bet: float, mine_count: int) -> dict:
        _cleanup_old_sessions(_mines_sessions)
        if mine_count < 1 or mine_count > 24:
            raise ValueError('Кількість мін: 1–24.')
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])

        mine_set: set[int] = set()
        while len(mine_set) < mine_count:
            mine_set.add(random.randint(0, self.MINES_GRID - 1))

        session_id = secrets.token_hex(16)
        _mines_sessions[session_id] = {
            'user_id': user_id, 'bet': bet, 'mine_count': mine_count,
            'mines': mine_set, 'revealed': set(), 'status': 'playing',
            'started_at': time.time(),
        }
        new_balance = self.repo.update_balance(user_id, -bet)
        self.repo.add_xp(user_id, max(1, int(bet / 20)))
        return {'session_id': session_id, 'new_balance': new_balance, 'mine_count': mine_count}

    def reveal_mines_tile(self, user_id: int, session_id: str, tile: int) -> dict:
        sess = _mines_sessions.get(session_id)
        if not sess:
            raise ValueError('Сесія не знайдена.')
        if sess['user_id'] != user_id:
            raise ValueError('Доступ заборонено.')
        if sess['status'] != 'playing':
            raise ValueError('Гра вже завершена.')
        if tile < 0 or tile >= self.MINES_GRID:
            raise ValueError('Невірний індекс клітинки.')
        if tile in sess['revealed']:
            raise ValueError('Клітинка вже відкрита.')

        sess['revealed'].add(tile)
        is_mine = tile in sess['mines']

        if is_mine:
            sess['status'] = 'lost'
            self.repo.add_bet_stats(user_id, sess['bet'], 0)
            self.repo.save_game(user_id, 'mines', sess['bet'], 0, {
                'mine_count': sess['mine_count'],
                'revealed': len(sess['revealed']),
                'mines': sorted(sess['mines']),
            })
            _mines_sessions.pop(session_id, None)
            return {
                'is_mine': True, 'tile': tile,
                'mines': sorted(sess['mines']),
                'new_balance': self.repo.ensure_wallet(user_id)['balance'],
            }

        gems = len(sess['revealed'])
        mult = self._mines_mult(gems, sess['mine_count'])
        return {'is_mine': False, 'tile': tile, 'gems': gems, 'mult': mult}

    def cashout_mines(self, user_id: int, session_id: str) -> dict:
        sess = _mines_sessions.get(session_id)
        if not sess:
            raise ValueError('Сесія не знайдена.')
        if sess['user_id'] != user_id:
            raise ValueError('Доступ заборонено.')
        if sess['status'] != 'playing':
            raise ValueError('Гра вже завершена.')
        if not sess['revealed']:
            raise ValueError('Відкрийте хоча б одну клітинку.')

        bet = sess['bet']
        mult = self._mines_mult(len(sess['revealed']), sess['mine_count'])
        win = round(bet * mult, 2)
        new_balance = self.repo.update_balance(user_id, win)
        self.repo.add_bet_stats(user_id, bet, win)
        if win >= 5000:
            self.repo.unlock_achievement(user_id, 'big_winner')
        self.repo.upsert_leaderboard(user_id, win)
        self.repo.save_game(user_id, 'mines', bet, win, {
            'mine_count': sess['mine_count'], 'gems': len(sess['revealed']), 'mult': mult,
        })
        _mines_sessions.pop(session_id, None)
        return {'mult': mult, 'win': win, 'bet': bet, 'net': win - bet, 'new_balance': new_balance}

    @staticmethod
    def _mines_mult(gems: int, mine_count: int) -> float:
        g = CasinoService.MINES_GRID
        m = 1.0
        for i in range(gems):
            m *= (g - mine_count - i) / (g - i)
        return round(0.97 / m, 2) if m > 0 else 1.0

    # ── Dice ──────────────────────────────────────────────────────────────────

    def roll_dice(self, user_id: int, bet: float, target: int, direction: str) -> dict:
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])
        if target < 2 or target > 97:
            raise ValueError('Мета: 2–97.')
        if direction not in ('over', 'under'):
            raise ValueError("Напрямок: 'over' або 'under'.")

        val = random.randint(1, 100)
        won = (val > target) if direction == 'over' else (val < target)
        win_chance = (100 - target) if direction == 'over' else target
        payout = round(98 / win_chance, 4)
        win = round(bet * payout, 2) if won else 0.0

        net = win - bet
        new_balance = self.repo.update_balance(user_id, net)
        self.repo.add_bet_stats(user_id, bet, win)
        xp = max(1, int(bet / 20))
        self.repo.add_xp(user_id, xp)
        self.repo.save_game(user_id, 'dice', bet, win, {
            'result': val, 'target': target, 'direction': direction, 'won': won,
        })
        if win >= 5000:
            self.repo.unlock_achievement(user_id, 'big_winner')
        if won:
            self.repo.upsert_leaderboard(user_id, win)

        return {
            'result': val, 'won': won, 'win': win, 'bet': bet,
            'net': net, 'payout': payout, 'new_balance': new_balance,
        }

    # ── Chicken Road ──────────────────────────────────────────────────────────

    _CHICKEN_RISKS = [0.05, 0.08, 0.10, 0.13, 0.16, 0.20, 0.24, 0.28, 0.33, 0.40]
    _CHICKEN_MULTS = [1.5, 2.2, 3.0, 4.2, 5.8, 8.0, 11.0, 16.0, 22.0, 30.0]

    def start_chicken(self, user_id: int, bet: float) -> dict:
        _cleanup_old_sessions(_chicken_sessions)
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])

        cars = [random.random() < risk for risk in self._CHICKEN_RISKS]
        session_id = secrets.token_hex(16)
        _chicken_sessions[session_id] = {
            'user_id': user_id, 'bet': bet, 'cars': cars,
            'lane': 0, 'status': 'playing', 'started_at': time.time(),
        }
        new_balance = self.repo.update_balance(user_id, -bet)
        self.repo.add_xp(user_id, max(1, int(bet / 20)))
        return {'session_id': session_id, 'new_balance': new_balance}

    def step_chicken(self, user_id: int, session_id: str) -> dict:
        sess = _chicken_sessions.get(session_id)
        if not sess:
            raise ValueError('Сесія не знайдена.')
        if sess['user_id'] != user_id:
            raise ValueError('Доступ заборонено.')
        if sess['status'] != 'playing':
            raise ValueError('Гра вже завершена.')

        lane = sess['lane']
        if lane >= len(self._CHICKEN_RISKS):
            raise ValueError('Курка вже на фініші.')

        hit = sess['cars'][lane]
        if hit:
            sess['status'] = 'hit'
            self.repo.add_bet_stats(user_id, sess['bet'], 0)
            self.repo.save_game(user_id, 'chicken', sess['bet'], 0, {'hit_lane': lane, 'cars': sess['cars']})
            _chicken_sessions.pop(session_id, None)
            return {'hit': True, 'lane': lane, 'cars': sess['cars'],
                    'new_balance': self.repo.ensure_wallet(user_id)['balance']}

        sess['lane'] = lane + 1
        mult = self._CHICKEN_MULTS[lane]
        finished = sess['lane'] >= len(self._CHICKEN_RISKS)
        if finished:
            return self._chicken_cashout(sess, session_id, user_id, mult)
        return {'hit': False, 'lane': sess['lane'], 'mult': mult}

    def cashout_chicken(self, user_id: int, session_id: str) -> dict:
        sess = _chicken_sessions.get(session_id)
        if not sess:
            raise ValueError('Сесія не знайдена.')
        if sess['user_id'] != user_id:
            raise ValueError('Доступ заборонено.')
        if sess['status'] != 'playing':
            raise ValueError('Гра вже завершена.')
        if sess['lane'] == 0:
            raise ValueError('Потрібно зробити хоча б один крок.')
        mult = self._CHICKEN_MULTS[sess['lane'] - 1]
        return self._chicken_cashout(sess, session_id, user_id, mult)

    def _chicken_cashout(self, sess: dict, session_id: str, user_id: int, mult: float) -> dict:
        bet = sess['bet']
        win = round(bet * mult, 2)
        new_balance = self.repo.update_balance(user_id, win)
        self.repo.add_bet_stats(user_id, bet, win)
        self.repo.upsert_leaderboard(user_id, win)
        self.repo.save_game(user_id, 'chicken', bet, win, {'lane': sess['lane'], 'mult': mult})
        _chicken_sessions.pop(session_id, None)
        return {'hit': False, 'cashed': True, 'mult': mult, 'win': win, 'net': win - bet, 'new_balance': new_balance}

    # ── Achievements ──────────────────────────────────────────────────────────

    def _check_roulette_achievements(self, user_id: int, number: int, win: float, bet: float) -> None:
        if number == 0:
            self.repo.unlock_achievement(user_id, 'roulette_zero')
        if win >= bet * 35:
            self.repo.unlock_achievement(user_id, 'roulette_straight_win')
        if win >= 10_000:
            self.repo.unlock_achievement(user_id, 'big_winner')

    def _check_slots_achievements(self, user_id: int, line: tuple, win: float, bet: float) -> None:
        if line == ('7️⃣', '7️⃣', '7️⃣'):
            self.repo.unlock_achievement(user_id, 'slots_jackpot')
        if win >= 5_000:
            self.repo.unlock_achievement(user_id, 'big_winner')

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _validate_bet(self, amount: float, balance: float) -> None:
        if amount < self.MIN_BET:
            raise ValueError(f'Мінімальна ставка: {self.MIN_BET} фішок.')
        if amount > self.MAX_BET:
            raise ValueError(f'Максимальна ставка: {self.MAX_BET} фішок.')
        if amount > balance:
            raise ValueError('Недостатньо фішок на балансі.')
