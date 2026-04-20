"""Сервіс підтримки користувачів."""
from __future__ import annotations

from ..repositories.chat_repository import ChatRepository
from ..repositories.message_repository import MessageRepository
from ..repositories.support_repository import SupportRepository
from ..repositories.user_repository import UserRepository


PRIORITY_LABELS = {'low': 'Низький', 'normal': 'Звичайний', 'high': 'Високий', 'urgent': 'Терміново'}
STATUS_LABELS   = {'open': 'Відкрито', 'in_progress': 'В обробці', 'resolved': 'Вирішено', 'closed': 'Закрито'}


class SupportService:
    def __init__(self) -> None:
        self.tickets = SupportRepository()
        self.chats   = ChatRepository()
        self.msgs    = MessageRepository()
        self.users   = UserRepository()

    def open_ticket(self, user_id: int, subject: str, first_message: str, priority: str = 'normal') -> dict:
        subject = (subject or 'Звернення до підтримки').strip()[:200]
        if priority not in PRIORITY_LABELS:
            priority = 'normal'

        support_title = f'[Підтримка] {subject}'
        chat_id = self.chats.create_chat(support_title, is_group=False, created_by=user_id)
        self.chats.add_member(chat_id, user_id, 'member')

        ticket_id = self.tickets.create_ticket(user_id, chat_id, subject, priority)

        if first_message.strip():
            from ..utils.security import encrypt_message
            body = encrypt_message(first_message.strip())
            msg_id = self.msgs.create(chat_id, user_id, body)
            self.msgs.mark_read(msg_id, user_id)
            self.chats.touch_updated_at(chat_id)

        ticket = self.tickets.get_by_id(ticket_id)
        chat   = self.chats.get_by_id(chat_id)
        return {'ticket': ticket, 'chat': chat}

    def get_ticket(self, ticket_id: int, user_id: int) -> dict:
        ticket = self.tickets.get_by_id(ticket_id)
        if not ticket:
            raise ValueError('Тікет не знайдено.')
        if ticket['user_id'] != user_id:
            user = self.users.get_by_id(user_id)
            if not user or user.get('role') not in ('admin', 'operator'):
                raise PermissionError('Доступ заборонено.')
        return ticket

    def list_user_tickets(self, user_id: int) -> list[dict]:
        return self.tickets.get_by_user(user_id)

    def list_all_tickets(self, agent_id: int, status: str | None = None) -> list[dict]:
        agent = self.users.get_by_id(agent_id)
        if not agent or agent.get('role') not in ('admin', 'operator'):
            raise PermissionError('Доступ заборонено.')
        tickets = self.tickets.list_all(status=status)
        stats   = self.tickets.count_by_status()
        return {'tickets': tickets, 'stats': stats}

    def resolve_ticket(self, ticket_id: int, agent_id: int) -> None:
        ticket = self.tickets.get_by_id(ticket_id)
        if not ticket:
            raise ValueError('Тікет не знайдено.')
        agent = self.users.get_by_id(agent_id)
        if not agent or agent.get('role') not in ('admin', 'operator'):
            raise PermissionError('Доступ заборонено.')
        self.tickets.set_status(ticket_id, 'resolved')

    def close_ticket(self, ticket_id: int, user_id: int) -> None:
        ticket = self.tickets.get_by_id(ticket_id)
        if not ticket:
            raise ValueError('Тікет не знайдено.')
        if ticket['user_id'] != user_id:
            raise PermissionError('Закривати може лише власник тікету.')
        self.tickets.set_status(ticket_id, 'closed')

    def assign_agent(self, ticket_id: int, agent_id: int, actor_id: int) -> None:
        actor = self.users.get_by_id(actor_id)
        if not actor or actor.get('role') not in ('admin', 'operator'):
            raise PermissionError('Доступ заборонено.')
        agent = self.users.get_by_id(agent_id)
        if not agent:
            raise ValueError('Агента не знайдено.')

        ticket = self.tickets.get_by_id(ticket_id)
        if not ticket:
            raise ValueError('Тікет не знайдено.')

        self.tickets.assign_agent(ticket_id, agent_id)
        self.chats.add_member(ticket['chat_id'], agent_id, 'member')
