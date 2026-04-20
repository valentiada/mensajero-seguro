"""Маршрути чатів."""
from __future__ import annotations

from flask import Blueprint, g, jsonify, request

from ..services.chat_service import ChatService
from .helpers import api_error, auth_required

chat_bp = Blueprint('chats', __name__, url_prefix='/api/chats')
chat_service = ChatService()


@chat_bp.get('')
@auth_required
def list_chats():
    try:
        chats = chat_service.list_user_chats(g.current_user['id'])
        return jsonify({'ok': True, 'data': chats})
    except Exception as exc:
        return api_error(str(exc))


@chat_bp.post('/direct')
@auth_required
def create_direct():
    data = request.get_json(force=True) or {}
    other_id = data.get('user_id')
    if not other_id:
        return api_error('Потрібно вказати user_id.')
    try:
        chat = chat_service.create_direct(g.current_user['id'], int(other_id))
        return jsonify({'ok': True, 'data': chat}), 201
    except Exception as exc:
        return api_error(str(exc))


@chat_bp.post('/group')
@auth_required
def create_group():
    data = request.get_json(force=True) or {}
    title = (data.get('title') or '').strip()
    member_ids = data.get('member_ids') or []
    try:
        chat = chat_service.create_group(g.current_user['id'], title, member_ids)
        return jsonify({'ok': True, 'data': chat}), 201
    except Exception as exc:
        return api_error(str(exc))


@chat_bp.get('/<int:chat_id>')
@auth_required
def get_chat(chat_id: int):
    try:
        chat = chat_service.get_chat(chat_id, g.current_user['id'])
        return jsonify({'ok': True, 'data': chat})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc), 404)


@chat_bp.post('/<int:chat_id>/members')
@auth_required
def add_member(chat_id: int):
    data = request.get_json(force=True) or {}
    user_id = data.get('user_id')
    if not user_id:
        return api_error('Потрібно вказати user_id.')
    try:
        chat_service.add_member(chat_id, g.current_user['id'], int(user_id))
        return jsonify({'ok': True})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))


@chat_bp.delete('/<int:chat_id>/leave')
@auth_required
def leave_chat(chat_id: int):
    try:
        chat_service.leave_chat(chat_id, g.current_user['id'])
        return jsonify({'ok': True})
    except Exception as exc:
        return api_error(str(exc))


@chat_bp.put('/<int:chat_id>/mute')
@auth_required
def set_mute(chat_id: int):
    data = request.get_json(force=True) or {}
    muted = bool(data.get('muted', True))
    try:
        chat_service.set_muted(chat_id, g.current_user['id'], muted)
        return jsonify({'ok': True})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))


@chat_bp.put('/<int:chat_id>/pin')
@auth_required
def set_pin(chat_id: int):
    data = request.get_json(force=True) or {}
    pinned = bool(data.get('pinned', True))
    try:
        chat_service.set_pinned(chat_id, g.current_user['id'], pinned)
        return jsonify({'ok': True})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))
