"""Сервіс казино — рулетка, слоти, профіль."""
from __future__ import annotations

import hashlib
import hmac
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
_pf_sessions: dict[str, dict] = {}   # provably-fair seed store
_blackjack_sessions: dict[str, dict] = {}

# ── Card game utilities ───────────────────────────────────────────────────────

_SUITS = ['♠', '♥', '♦', '♣']
_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
_CARD_W = {'A': 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
           '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10}
_BACCARAT_W = {'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
               '8': 8, '9': 9, '10': 0, 'J': 0, 'Q': 0, 'K': 0}


def _make_shoe(decks: int = 6) -> list[dict]:
    deck = [{'suit': s, 'value': v} for s in _SUITS for v in _VALUES] * decks
    random.shuffle(deck)
    return deck


def _hand_value(cards: list[dict]) -> int:
    total = sum(_CARD_W[c['value']] for c in cards)
    aces = sum(1 for c in cards if c['value'] == 'A')
    while total > 21 and aces:
        total -= 10
        aces -= 1
    return total


def _is_bj(cards: list[dict]) -> bool:
    return len(cards) == 2 and _hand_value(cards) == 21


def _baccarat_value(cards: list[dict]) -> int:
    return sum(_BACCARAT_W[c['value']] for c in cards) % 10


# ── Plinko multipliers (rows × risk) ─────────────────────────────────────────

_PLINKO_MULTS: dict[int, dict[str, list[float]]] = {
    8: {
        'low':    [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
        'medium': [13.0, 3.0, 1.3, 0.7, 0.4, 0.7, 1.3, 3.0, 13.0],
        'high':   [29.0, 4.0, 1.5, 0.3, 0.2, 0.3, 1.5, 4.0, 29.0],
    },
    12: {
        'low':    [10.0, 3.0, 1.6, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 1.6, 3.0, 10.0],
        'medium': [33.0, 11.0, 4.0, 2.0, 1.1, 0.6, 0.3, 0.6, 1.1, 2.0, 4.0, 11.0, 33.0],
        'high':   [130.0, 26.0, 9.0, 4.0, 2.0, 0.2, 0.2, 0.2, 2.0, 4.0, 9.0, 26.0, 130.0],
    },
    16: {
        'low':    [16.0, 9.0, 2.0, 1.4, 1.4, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.4, 1.4, 2.0, 9.0, 16.0],
        'medium': [110.0, 41.0, 10.0, 5.0, 3.0, 1.5, 1.0, 0.5, 0.3, 0.5, 1.0, 1.5, 3.0, 5.0, 10.0, 41.0, 110.0],
        'high':   [999.0, 130.0, 26.0, 9.0, 4.0, 2.0, 0.2, 0.2, 0.2, 0.2, 2.0, 4.0, 9.0, 26.0, 130.0, 999.0],
    },
}


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

    def new_pf_seed(self) -> dict:
        _cleanup_old_sessions(_pf_sessions)
        server_seed = secrets.token_hex(32)
        session_id = secrets.token_hex(16)
        _pf_sessions[session_id] = {'server_seed': server_seed, 'started_at': time.time()}
        seed_hash = hashlib.sha256(server_seed.encode()).hexdigest()
        return {'session_id': session_id, 'server_seed_hash': seed_hash}

    def roll_dice(self, user_id: int, bet: float, target: int, direction: str,
                  pf_session_id: str = '', client_seed: str = '') -> dict:
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])
        if target < 2 or target > 97:
            raise ValueError('Мета: 2–97.')
        if direction not in ('over', 'under'):
            raise ValueError("Напрямок: 'over' або 'under'.")

        server_seed_revealed: str | None = None
        if pf_session_id and pf_session_id in _pf_sessions:
            sess = _pf_sessions.pop(pf_session_id)
            server_seed = sess['server_seed']
            cs = client_seed or 'default'
            digest = hmac.new(server_seed.encode(), cs.encode(), hashlib.sha256).hexdigest()  # type: ignore[attr-defined]
            val = int(digest[:8], 16) % 100 + 1
            server_seed_revealed = server_seed
        else:
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

        res: dict[str, Any] = {
            'result': val, 'won': won, 'win': win, 'bet': bet,
            'net': net, 'payout': payout, 'new_balance': new_balance,
        }
        if server_seed_revealed:
            res['server_seed'] = server_seed_revealed
            res['client_seed'] = client_seed or 'default'
        return res

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

    # ── Blackjack ────────────────────────────────────────────────────────────

    def start_blackjack(self, user_id: int, bet: float) -> dict:
        _cleanup_old_sessions(_blackjack_sessions)
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])

        shoe = _make_shoe(6)
        player = [shoe.pop(), shoe.pop()]
        dealer = [shoe.pop(), shoe.pop()]

        session_id = secrets.token_hex(16)
        _blackjack_sessions[session_id] = {
            'user_id': user_id, 'bet': bet, 'shoe': shoe,
            'player': player, 'dealer': dealer,
            'status': 'playing', 'started_at': time.time(),
        }
        new_balance = self.repo.update_balance(user_id, -bet)
        self.repo.add_xp(user_id, max(1, int(bet / 20)))

        if _is_bj(player):
            return self._resolve_blackjack(session_id, user_id, bet, player, dealer, 'blackjack')

        return {
            'session_id': session_id,
            'new_balance': new_balance,
            'player': player,
            'dealer': [dealer[0]],
            'player_value': _hand_value(player),
            'status': 'playing',
        }

    def action_blackjack(self, user_id: int, session_id: str, action: str) -> dict:
        sess = _blackjack_sessions.get(session_id)
        if not sess:
            raise ValueError('Сесія не знайдена.')
        if sess['user_id'] != user_id:
            raise ValueError('Доступ заборонено.')
        if sess['status'] != 'playing':
            raise ValueError('Гра вже завершена.')

        player = sess['player']
        dealer = sess['dealer']
        shoe = sess['shoe']
        bet = sess['bet']

        if action == 'hit':
            player.append(shoe.pop())
            pv = _hand_value(player)
            if pv > 21:
                return self._resolve_blackjack(session_id, user_id, bet, player, dealer, 'dealer_done')
            return {
                'session_id': session_id,
                'player': player,
                'dealer': [dealer[0]],
                'player_value': pv,
                'status': 'playing',
            }

        if action == 'double':
            wallet = self.repo.ensure_wallet(user_id)
            if wallet['balance'] < bet:
                raise ValueError('Недостатньо коштів для подвоєння.')
            self.repo.update_balance(user_id, -bet)
            sess['bet'] = bet * 2
            player.append(shoe.pop())
            return self._dealer_play(session_id, user_id, sess['bet'], player, dealer, shoe)

        if action == 'stand':
            return self._dealer_play(session_id, user_id, bet, player, dealer, shoe)

        raise ValueError('Дія: hit, stand або double.')

    def _dealer_play(self, session_id: str, user_id: int, bet: float,
                     player: list, dealer: list, shoe: list) -> dict:
        while _hand_value(dealer) < 17:
            dealer.append(shoe.pop())
        return self._resolve_blackjack(session_id, user_id, bet, player, dealer, 'dealer_done')

    def _resolve_blackjack(self, session_id: str, user_id: int, bet: float,
                            player: list, dealer: list, trigger: str) -> dict:
        pv = _hand_value(player)
        dv = _hand_value(dealer)

        if trigger == 'blackjack':
            if _is_bj(dealer):
                outcome, win = 'push', bet
            else:
                outcome, win = 'blackjack', round(bet * 2.5, 2)
        elif pv > 21:
            outcome, win = 'loss', 0.0
        elif dv > 21 or pv > dv:
            outcome, win = 'win', bet * 2
        elif pv == dv:
            outcome, win = 'push', bet
        else:
            outcome, win = 'loss', 0.0

        if win > 0:
            new_balance = self.repo.update_balance(user_id, win)
        else:
            new_balance = self.repo.ensure_wallet(user_id)['balance']

        self.repo.add_bet_stats(user_id, bet, win)
        self.repo.save_game(user_id, 'blackjack', bet, win, {
            'player': [c['value'] for c in player], 'dealer': [c['value'] for c in dealer],
            'player_value': pv, 'dealer_value': dv, 'outcome': outcome,
        })
        if win >= 5000:
            self.repo.unlock_achievement(user_id, 'big_winner')
        if win > 0:
            self.repo.upsert_leaderboard(user_id, win)
        _blackjack_sessions.pop(session_id, None)

        return {
            'session_id': session_id, 'player': player, 'dealer': dealer,
            'player_value': pv, 'dealer_value': dv,
            'outcome': outcome, 'win': win, 'bet': bet,
            'net': win - bet, 'new_balance': new_balance, 'status': 'done',
        }

    # ── Baccarat ─────────────────────────────────────────────────────────────

    def play_baccarat(self, user_id: int, bet_type: str, amount: float) -> dict:
        if bet_type not in ('player', 'banker', 'tie'):
            raise ValueError("Тип ставки: 'player', 'banker' або 'tie'.")
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(amount, wallet['balance'])

        shoe = _make_shoe(8)
        p_cards = [shoe.pop(), shoe.pop()]
        b_cards = [shoe.pop(), shoe.pop()]
        pv = _baccarat_value(p_cards)
        bv = _baccarat_value(b_cards)

        if pv < 8 and bv < 8:
            p3: int | None = None
            if pv <= 5:
                p_cards.append(shoe.pop())
                pv = _baccarat_value(p_cards)
                p3 = _BACCARAT_W[p_cards[2]['value']]
            b_draws = (
                bv <= 2 or
                (p3 is not None and (
                    (bv == 3 and p3 != 8) or
                    (bv == 4 and p3 in (2, 3, 4, 5, 6, 7)) or
                    (bv == 5 and p3 in (4, 5, 6, 7)) or
                    (bv == 6 and p3 in (6, 7))
                )) or
                (p3 is None and bv <= 5)
            )
            if b_draws:
                b_cards.append(shoe.pop())
                bv = _baccarat_value(b_cards)

        winner = 'player' if pv > bv else ('banker' if bv > pv else 'tie')

        if bet_type == winner:
            if winner == 'player':
                win = round(amount * 2, 2)
            elif winner == 'banker':
                win = round(amount * 1.95, 2)
            else:
                win = round(amount * 9, 2)
        elif winner == 'tie' and bet_type in ('player', 'banker'):
            win = amount  # push
        else:
            win = 0.0

        net = win - amount
        new_balance = self.repo.update_balance(user_id, net)
        self.repo.add_bet_stats(user_id, amount, win)
        self.repo.add_xp(user_id, max(1, int(amount / 20)))
        self.repo.save_game(user_id, 'baccarat', amount, win, {
            'player_cards': [c['value'] for c in p_cards],
            'banker_cards': [c['value'] for c in b_cards],
            'player_value': pv, 'banker_value': bv, 'winner': winner, 'bet_type': bet_type,
        })
        if win > 0:
            self.repo.upsert_leaderboard(user_id, win)

        return {
            'player_cards': p_cards, 'banker_cards': b_cards,
            'player_value': pv, 'banker_value': bv,
            'winner': winner, 'bet_type': bet_type,
            'win': win, 'amount': amount, 'net': net, 'new_balance': new_balance,
        }

    # ── Plinko ───────────────────────────────────────────────────────────────

    def play_plinko(self, user_id: int, bet: float, rows: int, risk: str) -> dict:
        if rows not in _PLINKO_MULTS:
            raise ValueError(f'Рядки: {sorted(_PLINKO_MULTS.keys())}.')
        if risk not in ('low', 'medium', 'high'):
            raise ValueError("Ризик: 'low', 'medium' або 'high'.")
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])

        path = [random.randint(0, 1) for _ in range(rows)]
        bucket = sum(path)
        mult = _PLINKO_MULTS[rows][risk][bucket]
        win = round(bet * mult, 2)

        net = win - bet
        new_balance = self.repo.update_balance(user_id, net)
        self.repo.add_bet_stats(user_id, bet, win)
        self.repo.add_xp(user_id, max(1, int(bet / 20)))
        self.repo.save_game(user_id, 'plinko', bet, win, {
            'rows': rows, 'risk': risk, 'bucket': bucket, 'mult': mult, 'path': path,
        })
        if win > 0:
            self.repo.upsert_leaderboard(user_id, win)
        if win >= 5000:
            self.repo.unlock_achievement(user_id, 'big_winner')

        return {
            'path': path, 'bucket': bucket, 'rows': rows, 'risk': risk,
            'mult': mult, 'win': win, 'bet': bet, 'net': net,
            'new_balance': new_balance,
            'multipliers': _PLINKO_MULTS[rows][risk],
        }

    # ── Limbo ────────────────────────────────────────────────────────────────
    def play_limbo(self, user_id: int, bet: float, target: float) -> dict:
        if target < 1.01 or target > 1000:
            raise ValueError('Цільовий множник: 1.01 — 1000.')
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])

        raw = secrets.randbelow(10_000_000) / 10_000_000
        result_mult = max(1.00, 99.0 / max(raw * 100, 0.001))
        result_mult = round(min(result_mult, 1_000_000), 2)
        won = result_mult >= target
        win = round(bet * target, 2) if won else 0.0

        net = win - bet
        new_balance = self.repo.update_balance(user_id, net)
        self.repo.add_bet_stats(user_id, bet, win)
        self.repo.add_xp(user_id, max(1, int(bet / 20)))
        self.repo.save_game(user_id, 'limbo', bet, win, {
            'target': target, 'result': result_mult, 'won': won,
        })
        if win > 0:
            self.repo.upsert_leaderboard(user_id, win)
        if win >= 10_000:
            self.repo.unlock_achievement(user_id, 'big_winner')

        return {
            'target': target, 'result': result_mult, 'won': won,
            'win': win, 'bet': bet, 'net': net,
            'new_balance': new_balance,
        }

    # ── Wheel ────────────────────────────────────────────────────────────────
    # Stake-style wheel: 54 segments, risk level changes multiplier distribution
    def play_wheel(self, user_id: int, bet: float, risk: str, segments: int = 30) -> dict:
        if risk not in ('low', 'medium', 'high'):
            raise ValueError("Ризик: 'low', 'medium', 'high'.")
        if segments not in (10, 20, 30, 40, 50):
            raise ValueError('Сегменти: 10, 20, 30, 40, 50.')
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])

        # Build wheel multipliers (sum ≤ segments for ~1% house edge)
        wheel = self._build_wheel(risk, segments)
        idx = secrets.randbelow(segments)
        mult = wheel[idx]
        win = round(bet * mult, 2)

        net = win - bet
        new_balance = self.repo.update_balance(user_id, net)
        self.repo.add_bet_stats(user_id, bet, win)
        self.repo.add_xp(user_id, max(1, int(bet / 20)))
        self.repo.save_game(user_id, 'wheel', bet, win, {
            'risk': risk, 'segments': segments, 'idx': idx, 'mult': mult,
        })
        if win > 0:
            self.repo.upsert_leaderboard(user_id, win)
        if win >= 5000:
            self.repo.unlock_achievement(user_id, 'big_winner')

        return {
            'risk': risk, 'segments': segments, 'wheel': wheel,
            'idx': idx, 'mult': mult, 'win': win, 'bet': bet, 'net': net,
            'new_balance': new_balance,
        }

    def _build_wheel(self, risk: str, n: int) -> list[float]:
        # Ratios approximating Stake.com. Rest of segments are 0.
        if risk == 'low':
            base = {'1.5': 2, '1.2': int(n * 0.35)}
            zero = n - sum(base.values())
            arr = [1.5]*2 + [1.2]*base['1.2'] + [0.0]*zero
        elif risk == 'medium':
            base = {'3': 1, '1.5': int(n * 0.25), '1.2': int(n * 0.15)}
            zero = n - sum(base.values())
            arr = [3.0]*1 + [1.5]*base['1.5'] + [1.2]*base['1.2'] + [0.0]*zero
        else:  # high
            arr = [9.9] + [0.0]*(n-1) if n <= 10 else [19.8] + [0.0]*(n-1) if n <= 20 else [29.7] + [0.0]*(n-1) if n <= 30 else [39.6] + [0.0]*(n-1) if n <= 40 else [49.5] + [0.0]*(n-1)
        # Shuffle deterministically based on secrets for visual variety
        rng = random.Random(secrets.randbelow(1_000_000))
        rng.shuffle(arr)
        return arr

    # ── Hilo ─────────────────────────────────────────────────────────────────
    # Sessions: {session_id: {user, bet, current_card, multiplier, cards_seen}}
    _hilo_sessions: dict = {}

    def start_hilo(self, user_id: int, bet: float) -> dict:
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])
        new_balance = self.repo.update_balance(user_id, -bet)

        session_id = secrets.token_urlsafe(16)
        card = self._draw_hilo_card()
        self._hilo_sessions[session_id] = {
            'user_id': user_id, 'bet': bet, 'current': card,
            'multiplier': 1.0, 'history': [card],
        }
        return {
            'session_id': session_id, 'card': card, 'multiplier': 1.0,
            'balance': new_balance, 'bet': bet,
        }

    def guess_hilo(self, user_id: int, session_id: str, guess: str) -> dict:
        if guess not in ('higher', 'lower', 'equal'):
            raise ValueError("Вгадай: 'higher', 'lower', 'equal'.")
        s = self._hilo_sessions.get(session_id)
        if not s or s['user_id'] != user_id:
            raise ValueError('Сесію не знайдено.')

        cur_v = s['current']['rank_value']
        new_card = self._draw_hilo_card()
        new_v = new_card['rank_value']
        s['history'].append(new_card)

        # Payout odds per remaining deck probability
        if guess == 'higher':
            won = new_v > cur_v
            prob = (14 - cur_v) / 13  # of getting higher among 2..14
        elif guess == 'lower':
            won = new_v < cur_v
            prob = (cur_v - 1) / 13
        else:  # equal
            won = new_v == cur_v
            prob = 1 / 13

        if not won or prob <= 0:
            self._hilo_sessions.pop(session_id, None)
            self.repo.add_bet_stats(user_id, s['bet'], 0)
            self.repo.save_game(user_id, 'hilo', s['bet'], 0, {
                'history': s['history'], 'final_mult': s['multiplier'], 'bust': True,
            })
            wallet = self.repo.ensure_wallet(user_id)
            return {
                'won': False, 'bust': True, 'card': new_card,
                'multiplier': 0.0, 'win': 0.0, 'new_balance': wallet['balance'],
            }

        # House edge ~5%
        step_mult = round((1 / prob) * 0.95, 4)
        s['multiplier'] = round(s['multiplier'] * step_mult, 4)
        s['current'] = new_card

        return {
            'won': True, 'bust': False, 'card': new_card,
            'multiplier': s['multiplier'], 'current': new_card,
            'step_mult': step_mult,
        }

    def cashout_hilo(self, user_id: int, session_id: str) -> dict:
        s = self._hilo_sessions.pop(session_id, None)
        if not s or s['user_id'] != user_id:
            raise ValueError('Сесію не знайдено.')
        win = round(s['bet'] * s['multiplier'], 2)
        new_balance = self.repo.update_balance(user_id, win)
        self.repo.add_bet_stats(user_id, s['bet'], win)
        self.repo.add_xp(user_id, max(1, int(s['bet'] / 20)))
        self.repo.save_game(user_id, 'hilo', s['bet'], win, {
            'history': s['history'], 'final_mult': s['multiplier'], 'bust': False,
        })
        if win > 0:
            self.repo.upsert_leaderboard(user_id, win)
        if win >= 5000:
            self.repo.unlock_achievement(user_id, 'big_winner')
        return {
            'win': win, 'multiplier': s['multiplier'],
            'new_balance': new_balance,
        }

    def _draw_hilo_card(self) -> dict:
        # 2..10 = face value; J=11, Q=12, K=13, A=14
        rank_idx = secrets.randbelow(13)  # 0..12
        ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
        suits = ['♠','♥','♦','♣']
        suit = suits[secrets.randbelow(4)]
        return {
            'rank': ranks[rank_idx],
            'rank_value': rank_idx + 2,
            'suit': suit,
        }

    # ── Tower (Stake-style) ──────────────────────────────────────────────────
    # Sessions: {session_id: {user, bet, difficulty, level, pattern, multiplier}}
    _tower_sessions: dict = {}

    _TOWER_CFG = {
        'easy':   {'cols': 4, 'safe': 3, 'levels': 9},   # 3 of 4 safe, 9 levels
        'medium': {'cols': 3, 'safe': 2, 'levels': 9},   # 2 of 3 safe
        'hard':   {'cols': 2, 'safe': 1, 'levels': 9},   # 1 of 2 safe
        'expert': {'cols': 3, 'safe': 1, 'levels': 9},   # 1 of 3 safe
    }

    def _tower_multiplier(self, difficulty: str, level: int) -> float:
        cfg = self._TOWER_CFG[difficulty]
        prob = cfg['safe'] / cfg['cols']
        # With 3% house edge compounded
        return round((1 / prob) ** level * 0.97, 4)

    def start_tower(self, user_id: int, bet: float, difficulty: str) -> dict:
        if difficulty not in self._TOWER_CFG:
            raise ValueError('Складність: easy, medium, hard, expert.')
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])
        new_balance = self.repo.update_balance(user_id, -bet)

        cfg = self._TOWER_CFG[difficulty]
        pattern = []  # pattern[level] = list of safe column indices
        for _ in range(cfg['levels']):
            cols = list(range(cfg['cols']))
            random.Random(secrets.token_bytes(16)).shuffle(cols)
            pattern.append(cols[:cfg['safe']])

        session_id = secrets.token_urlsafe(16)
        self._tower_sessions[session_id] = {
            'user_id': user_id, 'bet': bet, 'difficulty': difficulty,
            'level': 0, 'pattern': pattern, 'revealed': [],
        }
        return {
            'session_id': session_id,
            'bet': bet,
            'difficulty': difficulty,
            'cols': cfg['cols'],
            'levels': cfg['levels'],
            'current_level': 0,
            'multiplier': 1.0,
            'next_multiplier': self._tower_multiplier(difficulty, 1),
            'new_balance': new_balance,
        }

    def pick_tower(self, user_id: int, session_id: str, col: int) -> dict:
        s = self._tower_sessions.get(session_id)
        if not s or s['user_id'] != user_id:
            raise ValueError('Сесію не знайдено.')
        cfg = self._TOWER_CFG[s['difficulty']]
        if col < 0 or col >= cfg['cols']:
            raise ValueError('Невірна колонка.')
        level = s['level']
        safe = s['pattern'][level]
        won = col in safe

        if not won:
            self._tower_sessions.pop(session_id, None)
            self.repo.add_bet_stats(user_id, s['bet'], 0)
            self.repo.save_game(user_id, 'tower', s['bet'], 0, {
                'difficulty': s['difficulty'], 'level': level, 'bust': True,
            })
            return {
                'bust': True, 'col': col, 'safe_cols': safe,
                'pattern': s['pattern'], 'multiplier': 0.0,
                'win': 0.0,
            }

        s['revealed'].append({'level': level, 'col': col})
        s['level'] += 1
        cur_mult = self._tower_multiplier(s['difficulty'], s['level'])
        next_mult = self._tower_multiplier(s['difficulty'], s['level'] + 1) if s['level'] < cfg['levels'] else None

        # Auto-cashout on reaching top
        if s['level'] >= cfg['levels']:
            win = round(s['bet'] * cur_mult, 2)
            new_balance = self.repo.update_balance(user_id, win)
            self.repo.add_bet_stats(user_id, s['bet'], win)
            self.repo.add_xp(user_id, max(1, int(s['bet'] / 10)))
            self.repo.save_game(user_id, 'tower', s['bet'], win, {
                'difficulty': s['difficulty'], 'level': s['level'], 'top': True,
            })
            if win > 0:
                self.repo.upsert_leaderboard(user_id, win)
            if win >= 5000:
                self.repo.unlock_achievement(user_id, 'big_winner')
            self._tower_sessions.pop(session_id, None)
            return {
                'bust': False, 'col': col, 'safe_cols': safe,
                'top': True, 'multiplier': cur_mult, 'win': win,
                'new_balance': new_balance,
            }

        return {
            'bust': False, 'col': col, 'safe_cols': safe,
            'level': s['level'], 'multiplier': cur_mult,
            'next_multiplier': next_mult,
        }

    def cashout_tower(self, user_id: int, session_id: str) -> dict:
        s = self._tower_sessions.pop(session_id, None)
        if not s or s['user_id'] != user_id:
            raise ValueError('Сесію не знайдено.')
        if s['level'] == 0:
            raise ValueError('Потрібно пройти хоча б один рівень.')
        mult = self._tower_multiplier(s['difficulty'], s['level'])
        win = round(s['bet'] * mult, 2)
        new_balance = self.repo.update_balance(user_id, win)
        self.repo.add_bet_stats(user_id, s['bet'], win)
        self.repo.add_xp(user_id, max(1, int(s['bet'] / 20)))
        self.repo.save_game(user_id, 'tower', s['bet'], win, {
            'difficulty': s['difficulty'], 'level': s['level'], 'cashout': True,
        })
        if win > 0:
            self.repo.upsert_leaderboard(user_id, win)
        if win >= 5000:
            self.repo.unlock_achievement(user_id, 'big_winner')
        return {
            'win': win, 'multiplier': mult, 'new_balance': new_balance,
            'pattern': s['pattern'],
        }

    # ── Keno ─────────────────────────────────────────────────────────────────
    # Classic Keno: pick 1-10 from 40, 10 drawn, payouts by matches
    _KENO_PAYOUTS = {
        # picks: [mult for 0 matches, 1, 2, ... picks matches]
        1: [0.00, 3.96],
        2: [0.00, 1.90, 4.50],
        3: [0.00, 1.00, 3.10, 10.40],
        4: [0.00, 0.80, 1.80, 5.00, 22.50],
        5: [0.00, 0.25, 1.40, 4.10, 16.50, 36.00],
        6: [0.00, 0.00, 1.00, 3.00, 8.00, 16.00, 40.00],
        7: [0.00, 0.00, 1.00, 1.55, 3.00, 15.00, 40.00, 90.00],
        8: [0.00, 0.00, 0.00, 2.00, 4.00, 11.00, 28.00, 90.00, 185.00],
        9: [0.00, 0.00, 0.00, 2.00, 2.50, 5.00, 15.00, 40.00, 90.00, 400.00],
        10:[0.00, 0.00, 0.00, 1.60, 2.00, 4.00, 7.00, 17.00, 50.00, 200.00, 800.00],
    }
    _KENO_POOL = 40
    _KENO_DRAW = 10

    def play_keno(self, user_id: int, bet: float, picks: list[int]) -> dict:
        if not picks or len(picks) < 1 or len(picks) > 10:
            raise ValueError('Потрібно обрати 1–10 чисел.')
        if len(set(picks)) != len(picks):
            raise ValueError('Числа не можуть повторюватись.')
        if any(p < 1 or p > self._KENO_POOL for p in picks):
            raise ValueError(f'Числа: 1–{self._KENO_POOL}.')
        wallet = self.repo.ensure_wallet(user_id)
        self._validate_bet(bet, wallet['balance'])

        pool = list(range(1, self._KENO_POOL + 1))
        random.Random(secrets.token_bytes(16)).shuffle(pool)
        drawn = sorted(pool[:self._KENO_DRAW])
        drawn_set = set(drawn)

        matches = len([p for p in picks if p in drawn_set])
        mult = self._KENO_PAYOUTS[len(picks)][matches]
        win = round(bet * mult, 2)

        net = win - bet
        new_balance = self.repo.update_balance(user_id, net)
        self.repo.add_bet_stats(user_id, bet, win)
        self.repo.add_xp(user_id, max(1, int(bet / 20)))
        self.repo.save_game(user_id, 'keno', bet, win, {
            'picks': picks, 'drawn': drawn, 'matches': matches, 'mult': mult,
        })
        if win > 0:
            self.repo.upsert_leaderboard(user_id, win)
        if win >= 5000:
            self.repo.unlock_achievement(user_id, 'big_winner')

        return {
            'picks': picks, 'drawn': drawn, 'matches': matches,
            'mult': mult, 'win': win, 'bet': bet, 'net': net,
            'new_balance': new_balance,
        }

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
