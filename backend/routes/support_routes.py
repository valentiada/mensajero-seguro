"""Маршрути чату підтримки."""
from __future__ import annotations

from flask import Blueprint, g, jsonify, request

from ..services.support_service import SupportService
from .helpers import api_error, auth_required

support_bp = Blueprint('support', __name__, url_prefix='/api/support')
support_service = SupportService()


@support_bp.post('/tickets')
@auth_required
def open_ticket():
    data   = request.get_json(force=True) or {}
    subject = (data.get('subject') or 'Звернення').strip()
    body    = (data.get('message') or '').strip()
    priority = (data.get('priority') or 'normal').strip()
    if not body:
        return api_error('Опишіть проблему у першому повідомленні.')
    try:
        result = support_service.open_ticket(g.current_user['id'], subject, body, priority)
        return jsonify({'ok': True, 'data': result}), 201
    except Exception as exc:
        return api_error(str(exc))


@support_bp.get('/tickets')
@auth_required
def list_tickets():
    user   = g.current_user
    status = request.args.get('status')
    if user.get('role') in ('admin', 'operator'):
        try:
            data = support_service.list_all_tickets(user['id'], status or None)
            return jsonify({'ok': True, 'data': data})
        except PermissionError as exc:
            return api_error(str(exc), 403)
        except Exception as exc:
            return api_error(str(exc))
    tickets = support_service.list_user_tickets(user['id'])
    return jsonify({'ok': True, 'data': tickets})


@support_bp.get('/tickets/<int:ticket_id>')
@auth_required
def get_ticket(ticket_id: int):
    try:
        ticket = support_service.get_ticket(ticket_id, g.current_user['id'])
        return jsonify({'ok': True, 'data': ticket})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc), 404)


@support_bp.post('/tickets/<int:ticket_id>/resolve')
@auth_required
def resolve_ticket(ticket_id: int):
    try:
        support_service.resolve_ticket(ticket_id, g.current_user['id'])
        return jsonify({'ok': True})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))


@support_bp.post('/tickets/<int:ticket_id>/close')
@auth_required
def close_ticket(ticket_id: int):
    try:
        support_service.close_ticket(ticket_id, g.current_user['id'])
        return jsonify({'ok': True})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))


@support_bp.post('/tickets/<int:ticket_id>/assign')
@auth_required
def assign_ticket(ticket_id: int):
    data     = request.get_json(force=True) or {}
    agent_id = data.get('agent_id')
    if not agent_id:
        return api_error('Потрібно вказати agent_id.')
    try:
        support_service.assign_agent(ticket_id, int(agent_id), g.current_user['id'])
        return jsonify({'ok': True})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))
