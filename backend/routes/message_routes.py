"""Маршрути повідомлень."""
from __future__ import annotations

from flask import Blueprint, g, jsonify, request

from ..config import MSG_RATE_LIMIT, MSG_RATE_WINDOW_SECONDS
from ..services.message_service import MessageService
from .helpers import api_error, auth_required, rate_limit

msg_bp = Blueprint('messages', __name__, url_prefix='/api/chats')
msg_service = MessageService()


def _msg_rate_key():
    return f'msg:{g.current_user["id"]}'


@msg_bp.get('/<int:chat_id>/messages')
@auth_required
def list_messages(chat_id: int):
    before_id = request.args.get('before_id', type=int)
    limit = min(int(request.args.get('limit', 50)), 100)
    try:
        msgs = msg_service.list_messages(chat_id, g.current_user['id'], before_id=before_id, limit=limit)
        return jsonify({'ok': True, 'data': msgs})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))


@msg_bp.post('/<int:chat_id>/messages')
@auth_required
@rate_limit(MSG_RATE_LIMIT, MSG_RATE_WINDOW_SECONDS, key_func=_msg_rate_key)
def send_message(chat_id: int):
    data = request.get_json(force=True) or {}
    body = (data.get('body') or '').strip()
    reply_to_id = data.get('reply_to_id')
    if not body:
        return api_error('Тіло повідомлення не може бути порожнім.')
    try:
        msg = msg_service.send(chat_id, g.current_user['id'], body, reply_to_id)
        return jsonify({'ok': True, 'data': msg}), 201
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))


@msg_bp.put('/<int:chat_id>/messages/<int:message_id>')
@auth_required
def edit_message(chat_id: int, message_id: int):
    data = request.get_json(force=True) or {}
    body = (data.get('body') or '').strip()
    if not body:
        return api_error('Тіло повідомлення не може бути порожнім.')
    try:
        msg = msg_service.edit_message(message_id, g.current_user['id'], body)
        return jsonify({'ok': True, 'data': msg})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))


@msg_bp.delete('/<int:chat_id>/messages/<int:message_id>')
@auth_required
def delete_message(chat_id: int, message_id: int):
    try:
        msg_service.delete_message(message_id, g.current_user['id'])
        return jsonify({'ok': True})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))


@msg_bp.post('/<int:chat_id>/messages/<int:message_id>/read')
@auth_required
def mark_read(chat_id: int, message_id: int):
    msg_service.mark_read(message_id, g.current_user['id'])
    return jsonify({'ok': True})


@msg_bp.post('/<int:chat_id>/messages/<int:message_id>/reactions')
@auth_required
def add_reaction(chat_id: int, message_id: int):
    data = request.get_json(force=True) or {}
    emoji = (data.get('emoji') or '').strip()
    try:
        msg_service.add_reaction(message_id, g.current_user['id'], emoji)
        return jsonify({'ok': True})
    except Exception as exc:
        return api_error(str(exc))


@msg_bp.delete('/<int:chat_id>/messages/<int:message_id>/reactions')
@auth_required
def remove_reaction(chat_id: int, message_id: int):
    try:
        msg_service.remove_reaction(message_id, g.current_user['id'])
        return jsonify({'ok': True})
    except Exception as exc:
        return api_error(str(exc))
