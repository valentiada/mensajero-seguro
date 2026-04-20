"""Сервіс WebRTC дзвінків."""
from __future__ import annotations

from ..config import CALL_PENDING_TIMEOUT_SECONDS, ICE_SERVERS
from ..repositories.call_repository import CallRepository
from ..repositories.chat_repository import ChatRepository


class CallService:
    def __init__(self) -> None:
        self.calls = CallRepository()
        self.chats = ChatRepository()

    def initiate(self, chat_id: int, caller_id: int, call_type: str, sdp_offer: str) -> dict:
        if call_type not in ('audio', 'video'):
            raise ValueError('Тип дзвінка: audio або video.')
        if not self.chats.is_member(chat_id, caller_id):
            raise PermissionError('Ви не є учасником цього чату.')

        existing = self.calls.get_pending_for_chat(chat_id)
        if existing:
            raise ValueError('Вже є активний виклик у цьому чаті.')

        call_id = self.calls.create(chat_id, caller_id, call_type)
        self.calls.store_offer(call_id, sdp_offer)
        return {
            'call_id': call_id,
            'ice_servers': ICE_SERVERS,
            'pending_timeout': CALL_PENDING_TIMEOUT_SECONDS,
        }

    def answer(self, call_id: int, user_id: int, sdp_answer: str) -> dict:
        call = self.calls.get_by_id(call_id)
        if not call:
            raise ValueError('Дзвінок не знайдено.')
        if call['status'] != 'pending':
            raise ValueError('Дзвінок більше не очікує відповіді.')
        if not self.chats.is_member(call['chat_id'], user_id):
            raise PermissionError('Доступ заборонено.')

        self.calls.store_answer(call_id, sdp_answer)
        self.calls.set_started(call_id)
        return {'call_id': call_id, 'ice_servers': ICE_SERVERS}

    def decline(self, call_id: int, user_id: int) -> None:
        call = self.calls.get_by_id(call_id)
        if not call:
            raise ValueError('Дзвінок не знайдено.')
        if not self.chats.is_member(call['chat_id'], user_id):
            raise PermissionError('Доступ заборонено.')
        self.calls.set_status(call_id, 'declined')

    def end(self, call_id: int, user_id: int) -> None:
        call = self.calls.get_by_id(call_id)
        if not call:
            raise ValueError('Дзвінок не знайдено.')
        if not self.chats.is_member(call['chat_id'], user_id):
            raise PermissionError('Доступ заборонено.')
        self.calls.set_ended(call_id)

    def get_offer(self, call_id: int, user_id: int) -> dict:
        call = self.calls.get_by_id(call_id)
        if not call:
            raise ValueError('Дзвінок не знайдено.')
        if not self.chats.is_member(call['chat_id'], user_id):
            raise PermissionError('Доступ заборонено.')
        return {'sdp_offer': call.get('sdp_offer'), 'sdp_answer': call.get('sdp_answer')}

    def list_history(self, user_id: int, limit: int = 50) -> list[dict]:
        return self.calls.list_for_user(user_id, limit)
