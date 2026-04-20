"""Сервіс казино — рулетка, слоти, профіль."""
from __future__ import annotations

import random
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
