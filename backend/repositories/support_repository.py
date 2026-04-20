"""Репозиторій тікетів підтримки."""
from __future__ import annotations

from ..database import execute, query_all, query_one
from ..config import USE_PG


class SupportRepository:
    def create_ticket(self, user_id: int, chat_id: int, subject: str, priority: str = 'normal') -> int:
        sql = (
            'INSERT INTO support_tickets (user_id, chat_id, subject, priority) VALUES (?, ?, ?, ?)'
            + (' RETURNING id' if USE_PG else '')
        )
        return execute(sql, (user_id, chat_id, subject, priority))

    def get_by_id(self, ticket_id: int) -> dict | None:
        return query_one(
            'SELECT t.*, u.full_name AS user_name, a.full_name AS agent_name '
            'FROM support_tickets t '
            'JOIN users u ON u.id = t.user_id '
            'LEFT JOIN users a ON a.id = t.assigned_to '
            'WHERE t.id = ?',
            (ticket_id,),
        )

    def get_by_chat(self, chat_id: int) -> dict | None:
        return query_one(
            'SELECT * FROM support_tickets WHERE chat_id = ? ORDER BY id DESC LIMIT 1',
            (chat_id,),
        )

    def get_by_user(self, user_id: int) -> list[dict]:
        return query_all(
            'SELECT t.*, u.full_name AS user_name FROM support_tickets t '
            'JOIN users u ON u.id = t.user_id '
            'WHERE t.user_id = ? ORDER BY t.created_at DESC',
            (user_id,),
        )

    def list_all(self, status: str | None = None, limit: int = 50, offset: int = 0) -> list[dict]:
        if status:
            return query_all(
                'SELECT t.*, u.full_name AS user_name, a.full_name AS agent_name '
                'FROM support_tickets t '
                'JOIN users u ON u.id = t.user_id '
                'LEFT JOIN users a ON a.id = t.assigned_to '
                'WHERE t.status = ? ORDER BY t.created_at DESC LIMIT ? OFFSET ?',
                (status, limit, offset),
            )
        return query_all(
            'SELECT t.*, u.full_name AS user_name, a.full_name AS agent_name '
            'FROM support_tickets t '
            'JOIN users u ON u.id = t.user_id '
            'LEFT JOIN users a ON a.id = t.assigned_to '
            'ORDER BY t.created_at DESC LIMIT ? OFFSET ?',
            (limit, offset),
        )

    def set_status(self, ticket_id: int, status: str) -> None:
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        if status == 'resolved':
            execute(
                f'UPDATE support_tickets SET status = ?, resolved_at = {now_sql}, updated_at = {now_sql} WHERE id = ?',
                (status, ticket_id),
            )
        else:
            execute(
                f'UPDATE support_tickets SET status = ?, updated_at = {now_sql} WHERE id = ?',
                (status, ticket_id),
            )

    def assign_agent(self, ticket_id: int, agent_id: int) -> None:
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        execute(
            f"UPDATE support_tickets SET assigned_to = ?, status = 'in_progress', updated_at = {now_sql} WHERE id = ?",
            (agent_id, ticket_id),
        )

    def count_by_status(self) -> dict:
        rows = query_all(
            'SELECT status, COUNT(*) AS cnt FROM support_tickets GROUP BY status',
        )
        return {r['status']: r['cnt'] for r in rows}
