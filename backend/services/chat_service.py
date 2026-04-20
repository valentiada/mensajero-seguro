"""Сервіс чатів."""
from __future__ import annotations

from ..repositories.chat_repository import ChatRepository
from ..repositories.message_repository import MessageRepository
from ..repositories.user_repository import UserRepository
from ..utils.validators import validate_chat_title


class ChatService:
    def __init__(self) -> None:
        self.chats = ChatRepository()
        self.messages = MessageRepository()
        self.users = UserRepository()

    def create_direct(self, user_id: int, other_user_id: int) -> dict:
        if user_id == other_user_id:
            raise ValueError('Не можна створити чат із собою.')
        other = self.users.get_by_id(other_user_id)
        if not other:
            raise ValueError('Користувача не знайдено.')
        existing = self.chats.get_direct_chat(user_id, other_user_id)
        if existing:
            return existing

        chat_id = self.chats.create_chat(other['full_name'], is_group=False, created_by=user_id)
        self.chats.add_member(chat_id, user_id, 'member')
        self.chats.add_member(chat_id, other_user_id, 'member')
        return self.chats.get_by_id(chat_id)

    def create_group(self, user_id: int, title: str, member_ids: list[int]) -> dict:
        validate_chat_title(title)
        if len(member_ids) > 200:
            raise ValueError('Максимум 200 учасників у групі.')

        chat_id = self.chats.create_chat(title.strip(), is_group=True, created_by=user_id)
        self.chats.add_member(chat_id, user_id, 'admin')
        for mid in member_ids:
            if mid != user_id:
                self.chats.add_member(chat_id, mid, 'member')
        return self.chats.get_by_id(chat_id)

    def list_user_chats(self, user_id: int) -> list[dict]:
        chats = self.chats.list_user_chats(user_id)
        result = []
        for chat in chats:
            c = dict(chat)
            c['members'] = self.chats.get_members(c['id'])
            c['last_message'] = self.messages.get_last_message(c['id'])
            c['unread_count'] = self.chats.count_unread(c['id'], user_id)
            result.append(c)
        return result

    def get_chat(self, chat_id: int, user_id: int) -> dict:
        if not self.chats.is_member(chat_id, user_id):
            raise PermissionError('Доступ заборонено.')
        chat = self.chats.get_by_id(chat_id)
        if not chat:
            raise ValueError('Чат не знайдено.')
        chat = dict(chat)
        chat['members'] = self.chats.get_members(chat_id)
        return chat

    def add_member(self, chat_id: int, actor_id: int, new_user_id: int) -> None:
        if not self.chats.is_member(chat_id, actor_id):
            raise PermissionError('Доступ заборонено.')
        chat = self.chats.get_by_id(chat_id)
        if not chat or not chat.get('is_group'):
            raise ValueError('Можна додавати учасників лише до групових чатів.')
        self.chats.add_member(chat_id, new_user_id)

    def leave_chat(self, chat_id: int, user_id: int) -> None:
        self.chats.remove_member(chat_id, user_id)

    def set_muted(self, chat_id: int, user_id: int, muted: bool) -> None:
        if not self.chats.is_member(chat_id, user_id):
            raise PermissionError('Доступ заборонено.')
        self.chats.set_muted(chat_id, user_id, muted)

    def set_pinned(self, chat_id: int, user_id: int, pinned: bool) -> None:
        if not self.chats.is_member(chat_id, user_id):
            raise PermissionError('Доступ заборонено.')
        self.chats.set_pinned(chat_id, user_id, pinned)
