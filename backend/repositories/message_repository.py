"""Репозиторій повідомлень."""
from __future__ import annotations

from ..database import execute, query_all, query_one
from ..config import USE_PG


class MessageRepository:
    def create(self, chat_id: int, sender_id: int, body: str, reply_to_id: int | None = None) -> int:
        sql = (
            'INSERT INTO messages (chat_id, sender_id, body, reply_to_id) VALUES (?, ?, ?, ?)'
            + (' RETURNING id' if USE_PG else '')
        )
        return execute(sql, (chat_id, sender_id, body, reply_to_id))

    def get_by_id(self, message_id: int) -> dict | None:
        return query_one(
            'SELECT m.*, u.full_name AS sender_name FROM messages m '
            'JOIN users u ON u.id = m.sender_id '
            'WHERE m.id = ?',
            (message_id,),
        )

    def list_chat_messages(
        self,
        chat_id: int,
        before_id: int | None = None,
        limit: int = 50,
    ) -> list[dict]:
        if before_id:
            rows = query_all(
                'SELECT m.*, u.full_name AS sender_name FROM messages m '
                'JOIN users u ON u.id = m.sender_id '
                'WHERE m.chat_id = ? AND m.id < ? AND m.deleted = 0 '
                'ORDER BY m.id DESC LIMIT ?',
                (chat_id, before_id, limit),
            )
        else:
            rows = query_all(
                'SELECT m.*, u.full_name AS sender_name FROM messages m '
                'JOIN users u ON u.id = m.sender_id '
                'WHERE m.chat_id = ? AND m.deleted = 0 '
                'ORDER BY m.id DESC LIMIT ?',
                (chat_id, limit),
            )
        return list(reversed(rows))

    def edit(self, message_id: int, sender_id: int, new_body: str) -> bool:
        rows = execute(
            'UPDATE messages SET body = ?, edited = 1 WHERE id = ? AND sender_id = ? AND deleted = 0',
            (new_body, message_id, sender_id),
        )
        return bool(rows)

    def soft_delete(self, message_id: int, sender_id: int) -> bool:
        rows = execute(
            "UPDATE messages SET deleted = 1, body = '[Повідомлення видалено]' WHERE id = ? AND sender_id = ?",
            (message_id, sender_id),
        )
        return bool(rows)

    def mark_read(self, message_id: int, user_id: int) -> None:
        execute(
            'INSERT OR IGNORE INTO message_reads (message_id, user_id) VALUES (?, ?)',
            (message_id, user_id),
        )

    def get_read_by(self, message_id: int) -> list[int]:
        rows = query_all('SELECT user_id FROM message_reads WHERE message_id = ?', (message_id,))
        return [r['user_id'] for r in rows]

    def get_last_message(self, chat_id: int) -> dict | None:
        return query_one(
            'SELECT m.*, u.full_name AS sender_name FROM messages m '
            'JOIN users u ON u.id = m.sender_id '
            'WHERE m.chat_id = ? AND m.deleted = 0 '
            'ORDER BY m.id DESC LIMIT 1',
            (chat_id,),
        )

    def add_reaction(self, message_id: int, user_id: int, emoji: str) -> None:
        execute(
            'INSERT OR REPLACE INTO message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?)',
            (message_id, user_id, emoji),
        )

    def remove_reaction(self, message_id: int, user_id: int) -> None:
        execute('DELETE FROM message_reactions WHERE message_id = ? AND user_id = ?', (message_id, user_id))

    def get_reactions(self, message_id: int) -> list[dict]:
        return query_all(
            'SELECT emoji, COUNT(*) AS cnt FROM message_reactions WHERE message_id = ? GROUP BY emoji',
            (message_id,),
        )
