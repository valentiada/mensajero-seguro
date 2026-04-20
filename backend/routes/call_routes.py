"""Маршрути дзвінків (WebRTC сигналінг)."""
from __future__ import annotations

from flask import Blueprint, g, jsonify, request

from ..services.call_service import CallService
from .helpers import api_error, auth_required

call_bp = Blueprint('calls', __name__, url_prefix='/api/calls')
call_service = CallService()


@call_bp.post('')
@auth_required
def initiate():
    data = request.get_json(force=True) or {}
    chat_id = data.get('chat_id')
    call_type = (data.get('call_type') or 'audio').strip()
    sdp_offer = (data.get('sdp_offer') or '').strip()
    if not chat_id:
        return api_error('Потрібно вказати chat_id.')
    if not sdp_offer:
        return api_error('Потрібно вказати sdp_offer.')
    try:
        result = call_service.initiate(int(chat_id), g.current_user['id'], call_type, sdp_offer)
        return jsonify({'ok': True, 'data': result}), 201
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))


@call_bp.post('/<int:call_id>/answer')
@auth_required
def answer(call_id: int):
    data = request.get_json(force=True) or {}
    sdp_answer = (data.get('sdp_answer') or '').strip()
    if not sdp_answer:
        return api_error('Потрібно вказати sdp_answer.')
    try:
        result = call_service.answer(call_id, g.current_user['id'], sdp_answer)
        return jsonify({'ok': True, 'data': result})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))


@call_bp.post('/<int:call_id>/decline')
@auth_required
def decline(call_id: int):
    try:
        call_service.decline(call_id, g.current_user['id'])
        return jsonify({'ok': True})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))


@call_bp.post('/<int:call_id>/end')
@auth_required
def end(call_id: int):
    try:
        call_service.end(call_id, g.current_user['id'])
        return jsonify({'ok': True})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc))


@call_bp.get('/<int:call_id>/sdp')
@auth_required
def get_sdp(call_id: int):
    try:
        data = call_service.get_offer(call_id, g.current_user['id'])
        return jsonify({'ok': True, 'data': data})
    except PermissionError as exc:
        return api_error(str(exc), 403)
    except Exception as exc:
        return api_error(str(exc), 404)


@call_bp.get('/history')
@auth_required
def history():
    limit = min(int(request.args.get('limit', 50)), 100)
    try:
        data = call_service.list_history(g.current_user['id'], limit)
        return jsonify({'ok': True, 'data': data})
    except Exception as exc:
        return api_error(str(exc))
