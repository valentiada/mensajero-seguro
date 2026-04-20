"""Сервіс повідомлень."""
from __future__ import annotations

from ..repositories.chat_repository import ChatRepository
from ..repositories.message_repository import MessageRepository
from ..utils.security import decrypt_message, encrypt_message
from ..utils.validators import validate_message_body


class MessageService:
    def __init__(self) -> None:
        self.messages = MessageRepository()
        self.chats = ChatRepository()

    def send(self, chat_id: int, sender_id: int, body: str, reply_to_id: int | None = None) -> dict:
        validate_message_body(body)
        if not self.chats.is_member(chat_id, sender_id):
            raise PermissionError('Ви не є учасником цього чату.')

        encrypted = encrypt_message(body.strip())
        msg_id = self.messages.create(chat_id, sender_id, encrypted, reply_to_id)
        self.messages.mark_read(msg_id, sender_id)
        self.chats.touch_updated_at(chat_id)

        msg = self.messages.get_by_id(msg_id)
        return self._decrypt_row(msg)

    def list_messages(self, chat_id: int, user_id: int, before_id: int | None = None, limit: int = 50) -> list[dict]:
        if not self.chats.is_member(chat_id, user_id):
            raise PermissionError('Ви не є учасником цього чату.')
        rows = self.messages.list_chat_messages(chat_id, before_id=before_id, limit=limit)
        return [self._decrypt_row(r) for r in rows]

    def edit_message(self, message_id: int, user_id: int, new_body: str) -> dict:
        validate_message_body(new_body)
        msg = self.messages.get_by_id(message_id)
        if not msg:
            raise ValueError('Повідомлення не знайдено.')
        if msg['sender_id'] != user_id:
            raise PermissionError('Редагувати можна лише власні повідомлення.')

        encrypted = encrypt_message(new_body.strip())
        ok = self.messages.edit(message_id, user_id, encrypted)
        if not ok:
            raise ValueError('Не вдалося відредагувати повідомлення.')
        return self._decrypt_row(self.messages.get_by_id(message_id))

    def delete_message(self, message_id: int, user_id: int) -> None:
        msg = self.messages.get_by_id(message_id)
        if not msg:
            raise ValueError('Повідомлення не знайдено.')
        if msg['sender_id'] != user_id:
            raise PermissionError('Видаляти можна лише власні повідомлення.')
        self.messages.soft_delete(message_id, user_id)

    def mark_read(self, message_id: int, user_id: int) -> None:
        self.messages.mark_read(message_id, user_id)

    def add_reaction(self, message_id: int, user_id: int, emoji: str) -> None:
        allowed = {'👍', '❤️', '😂', '😮', '😢', '🙏', '👏', '🔥'}
        if emoji not in allowed:
            raise ValueError('Непідтримуваний емодзі.')
        self.messages.add_reaction(message_id, user_id, emoji)

    def remove_reaction(self, message_id: int, user_id: int) -> None:
        self.messages.remove_reaction(message_id, user_id)

    def _decrypt_row(self, row: dict | None) -> dict:
        if row is None:
            return {}
        r = dict(row)
        if not r.get('deleted'):
            r['body'] = decrypt_message(r.get('body', ''))
        r['read_by'] = self.messages.get_read_by(r['id'])
        r['reactions'] = self.messages.get_reactions(r['id'])
        return r
