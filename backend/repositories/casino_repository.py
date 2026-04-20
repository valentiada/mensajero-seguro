"""Репозиторій казино."""
from __future__ import annotations

import json

from ..database import execute, query_all, query_one
from ..config import USE_PG

_STARTER_BALANCE = 1000.0


class CasinoRepository:
    # ── Wallet ────────────────────────────────────────────────────────────────

    def get_wallet(self, user_id: int) -> dict | None:
        return query_one('SELECT * FROM casino_wallets WHERE user_id = ?', (user_id,))

    def ensure_wallet(self, user_id: int) -> dict:
        wallet = self.get_wallet(user_id)
        if wallet:
            return wallet
        sql = (
            'INSERT INTO casino_wallets (user_id, balance) VALUES (?, ?)'
            + (' RETURNING id' if USE_PG else '')
        )
        execute(sql, (user_id, _STARTER_BALANCE))
        return self.get_wallet(user_id)

    def update_balance(self, user_id: int, delta: float) -> float:
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        execute(
            f'UPDATE casino_wallets SET balance = balance + ?, updated_at = {now_sql} WHERE user_id = ?',
            (delta, user_id),
        )
        wallet = self.get_wallet(user_id)
        return wallet['balance'] if wallet else 0.0

    def add_bet_stats(self, user_id: int, bet: float, won: float) -> None:
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        execute(
            f'UPDATE casino_wallets SET total_bet = total_bet + ?, total_won = total_won + ?, updated_at = {now_sql} WHERE user_id = ?',
            (bet, won, user_id),
        )

    def add_xp(self, user_id: int, xp: int) -> None:
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        execute(
            f'UPDATE casino_wallets SET xp = xp + ?, updated_at = {now_sql} WHERE user_id = ?',
            (xp, user_id),
        )
        self._recalculate_level(user_id)

    def _recalculate_level(self, user_id: int) -> None:
        wallet = self.get_wallet(user_id)
        if not wallet:
            return
        xp = wallet['xp']
        level = max(1, int((xp / 500) ** 0.6) + 1)
        execute('UPDATE casino_wallets SET level = ? WHERE user_id = ?', (level, user_id))

    # ── Game history ──────────────────────────────────────────────────────────

    def save_game(self, user_id: int, game_type: str, bet: float, win: float, result_data: dict) -> int:
        sql = (
            'INSERT INTO casino_games (user_id, game_type, bet_amount, win_amount, result_data) VALUES (?, ?, ?, ?, ?)'
            + (' RETURNING id' if USE_PG else '')
        )
        return execute(sql, (user_id, game_type, bet, win, json.dumps(result_data, ensure_ascii=False)))

    def list_history(self, user_id: int, limit: int = 30) -> list[dict]:
        rows = query_all(
            'SELECT * FROM casino_games WHERE user_id = ? ORDER BY id DESC LIMIT ?',
            (user_id, limit),
        )
        for r in rows:
            try:
                r['result_data'] = json.loads(r.get('result_data') or '{}')
            except Exception:
                r['result_data'] = {}
        return rows

    # ── Achievements ──────────────────────────────────────────────────────────

    def unlock_achievement(self, user_id: int, key: str) -> bool:
        try:
            execute(
                'INSERT OR IGNORE INTO casino_achievements (user_id, achievement_key) VALUES (?, ?)',
                (user_id, key),
            )
            return True
        except Exception:
            return False

    def list_achievements(self, user_id: int) -> list[str]:
        rows = query_all('SELECT achievement_key FROM casino_achievements WHERE user_id = ?', (user_id,))
        return [r['achievement_key'] for r in rows]

    # ── Leaderboard ───────────────────────────────────────────────────────────

    def upsert_leaderboard(self, user_id: int, won: float) -> None:
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        if USE_PG:
            execute(
                f'''INSERT INTO casino_leaderboard (user_id, total_won, games_count, updated_at)
                    VALUES (?, ?, 1, {now_sql})
                    ON CONFLICT(user_id) DO UPDATE
                    SET total_won = casino_leaderboard.total_won + ?,
                        games_count = casino_leaderboard.games_count + 1,
                        updated_at = {now_sql}''',
                (user_id, won, won),
            )
        else:
            execute(
                f'''INSERT OR IGNORE INTO casino_leaderboard (user_id, total_won, games_count) VALUES (?, 0, 0);''',
                (user_id,),
            )
            execute(
                f'UPDATE casino_leaderboard SET total_won = total_won + ?, games_count = games_count + 1, updated_at = {now_sql} WHERE user_id = ?',
                (won, user_id),
            )

    def get_leaderboard(self, limit: int = 10) -> list[dict]:
        return query_all(
            'SELECT lb.*, u.full_name FROM casino_leaderboard lb '
            'JOIN users u ON u.id = lb.user_id '
            'ORDER BY lb.total_won DESC LIMIT ?',
            (limit,),
        )
