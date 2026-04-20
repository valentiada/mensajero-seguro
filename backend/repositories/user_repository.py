"""Репозиторій користувачів."""
from __future__ import annotations

from ..database import execute, get_connection, query_all, query_one
from ..config import USE_PG


class UserRepository:
    def get_by_id(self, user_id: int) -> dict | None:
        return query_one('SELECT * FROM users WHERE id = ?', (user_id,))

    def get_by_phone_or_email(self, identity: str) -> dict | None:
        # Email is stored lowercase, so normalize for comparison
        identity_lower = identity.lower()
        return query_one(
            'SELECT * FROM users WHERE phone = ? OR LOWER(email) = ?',
            (identity, identity_lower),
        )

    def create_user(self, full_name: str, phone: str, email: str, password_hash: str) -> int:
        sql = (
            'INSERT INTO users (full_name, phone, email, password_hash) VALUES (?, ?, ?, ?)'
            + (' RETURNING id' if USE_PG else '')
        )
        return execute(sql, (full_name, phone, email, password_hash))

    def update_password(self, user_id: int, password_hash: str) -> None:
        execute('UPDATE users SET password_hash = ? WHERE id = ?', (password_hash, user_id))

    def update_last_seen(self, user_id: int) -> None:
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        execute(f"UPDATE users SET last_seen_at = {now_sql} WHERE id = ?", (user_id,))

    def set_online(self, user_id: int, online: bool) -> None:
        execute('UPDATE users SET is_online = ? WHERE id = ?', (1 if online else 0, user_id))

    def search(self, query: str, exclude_id: int, limit: int = 20) -> list[dict]:
        q = f'%{query}%'
        return query_all(
            'SELECT id, full_name, phone, email, role, is_online, last_seen_at FROM users '
            'WHERE id != ? AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ?) LIMIT ?',
            (exclude_id, q, q, q, limit),
        )

    def list_users(self, limit: int = 100, offset: int = 0) -> list[dict]:
        return query_all(
            'SELECT id, full_name, phone, email, role, is_online, last_seen_at, created_at '
            'FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
            (limit, offset),
        )

    # ── Sessions ──────────────────────────────────────────────────────────────

    def create_session(self, user_id: int, token: str, expires_at: str) -> None:
        execute(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
            (user_id, token, expires_at),
        )

    def get_user_by_token(self, token: str) -> dict | None:
        return query_one(
            'SELECT u.*, s.expires_at, s.id AS session_id '
            'FROM sessions s JOIN users u ON u.id = s.user_id '
            'WHERE s.token = ?',
            (token,),
        )

    def delete_session(self, token: str) -> None:
        execute('DELETE FROM sessions WHERE token = ?', (token,))

    def delete_session_by_id(self, session_id: int, user_id: int) -> bool:
        rows = execute(
            'DELETE FROM sessions WHERE id = ? AND user_id = ?',
            (session_id, user_id),
        )
        return bool(rows)

    def delete_expired_sessions(self, user_id: int) -> None:
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        execute(
            f'DELETE FROM sessions WHERE user_id = ? AND expires_at < {now_sql}',
            (user_id,),
        )

    def list_sessions(self, user_id: int) -> list[dict]:
        return query_all(
            'SELECT id, created_at, expires_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC',
            (user_id,),
        )

    def update_session_expiry(self, token: str, expires_at: str) -> bool:
        rows = execute(
            'UPDATE sessions SET expires_at = ? WHERE token = ?',
            (expires_at, token),
        )
        return bool(rows)
