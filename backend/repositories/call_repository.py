"""Репозиторій дзвінків."""
from __future__ import annotations

from ..database import execute, query_all, query_one
from ..config import USE_PG


class CallRepository:
    def create(self, chat_id: int, caller_id: int, call_type: str) -> int:
        sql = (
            'INSERT INTO calls (chat_id, caller_id, call_type, status) VALUES (?, ?, ?, ?)'
            + (' RETURNING id' if USE_PG else '')
        )
        return execute(sql, (chat_id, caller_id, call_type, 'pending'))

    def get_by_id(self, call_id: int) -> dict | None:
        return query_one('SELECT * FROM calls WHERE id = ?', (call_id,))

    def get_pending_for_chat(self, chat_id: int) -> dict | None:
        return query_one(
            "SELECT * FROM calls WHERE chat_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1",
            (chat_id,),
        )

    def set_status(self, call_id: int, status: str) -> None:
        execute('UPDATE calls SET status = ? WHERE id = ?', (status, call_id))

    def set_started(self, call_id: int) -> None:
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        execute(
            f"UPDATE calls SET status = 'active', started_at = {now_sql} WHERE id = ?",
            (call_id,),
        )

    def set_ended(self, call_id: int) -> None:
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        execute(
            f"UPDATE calls SET status = 'ended', ended_at = {now_sql} WHERE id = ?",
            (call_id,),
        )

    def list_for_user(self, user_id: int, limit: int = 50) -> list[dict]:
        return query_all(
            'SELECT c.*, u.full_name AS caller_name FROM calls c '
            'JOIN users u ON u.id = c.caller_id '
            'JOIN chat_members cm ON cm.chat_id = c.chat_id AND cm.user_id = ? '
            'ORDER BY c.id DESC LIMIT ?',
            (user_id, limit),
        )

    def store_offer(self, call_id: int, sdp: str) -> None:
        execute('UPDATE calls SET sdp_offer = ? WHERE id = ?', (sdp, call_id))

    def store_answer(self, call_id: int, sdp: str) -> None:
        execute('UPDATE calls SET sdp_answer = ? WHERE id = ?', (sdp, call_id))
