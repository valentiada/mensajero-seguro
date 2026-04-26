"""Репозиторій чатів."""
from __future__ import annotations

from ..database import execute, query_all, query_one
from ..config import USE_PG


class ChatRepository:
    def create_chat(self, title: str, is_group: bool, created_by: int) -> int:
        sql = (
            'INSERT INTO chats (title, is_group, created_by) VALUES (?, ?, ?)'
            + (' RETURNING id' if USE_PG else '')
        )
        return execute(sql, (title, bool(is_group), created_by))

    def get_by_id(self, chat_id: int) -> dict | None:
        return query_one('SELECT * FROM chats WHERE id = ?', (chat_id,))

    def get_direct_chat(self, user_a: int, user_b: int) -> dict | None:
        return query_one(
            'SELECT c.* FROM chats c '
            'JOIN chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = ? '
            'JOIN chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = ? '
            'WHERE c.is_group = 0 LIMIT 1',
            (user_a, user_b),
        )

    def list_user_chats(self, user_id: int) -> list[dict]:
        return query_all(
            'SELECT c.*, cm.muted, cm.pinned '
            'FROM chats c '
            'JOIN chat_members cm ON cm.chat_id = c.id '
            'WHERE cm.user_id = ? '
            'ORDER BY cm.pinned DESC, c.updated_at DESC',
            (user_id,),
        )

    def add_member(self, chat_id: int, user_id: int, role: str = 'member') -> None:
        execute(
            'INSERT OR IGNORE INTO chat_members (chat_id, user_id, role) VALUES (?, ?, ?)',
            (chat_id, user_id, role),
        )

    def remove_member(self, chat_id: int, user_id: int) -> None:
        execute('DELETE FROM chat_members WHERE chat_id = ? AND user_id = ?', (chat_id, user_id))

    def get_members(self, chat_id: int) -> list[dict]:
        return query_all(
            'SELECT u.id, u.full_name, u.phone, u.email, u.is_online, u.last_seen_at, cm.role '
            'FROM chat_members cm JOIN users u ON u.id = cm.user_id '
            'WHERE cm.chat_id = ?',
            (chat_id,),
        )

    def is_member(self, chat_id: int, user_id: int) -> bool:
        row = query_one(
            'SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ?',
            (chat_id, user_id),
        )
        return bool(row)

    def set_muted(self, chat_id: int, user_id: int, muted: bool) -> None:
        execute(
            'UPDATE chat_members SET muted = ? WHERE chat_id = ? AND user_id = ?',
            (bool(muted), chat_id, user_id),
        )

    def set_pinned(self, chat_id: int, user_id: int, pinned: bool) -> None:
        execute(
            'UPDATE chat_members SET pinned = ? WHERE chat_id = ? AND user_id = ?',
            (bool(pinned), chat_id, user_id),
        )

    def touch_updated_at(self, chat_id: int) -> None:
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        execute(f'UPDATE chats SET updated_at = {now_sql} WHERE id = ?', (chat_id,))

    def count_unread(self, chat_id: int, user_id: int) -> int:
        row = query_one(
            'SELECT COUNT(*) AS cnt FROM messages '
            'WHERE chat_id = ? AND sender_id != ? '
            'AND id NOT IN (SELECT message_id FROM message_reads WHERE user_id = ?)',
            (chat_id, user_id, user_id),
        )
        return int((row or {}).get('cnt', 0))
