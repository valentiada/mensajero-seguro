"""Маршрути крипто-депозитів (BSC BEP-20)."""
from __future__ import annotations

import json

from flask import Blueprint, Response, jsonify, request, stream_with_context

from ..services.auth_service import AuthService
from ..services.crypto_service import CryptoService, subscribe_sse, unsubscribe_sse
from .helpers import api_error, auth_required

crypto_bp = Blueprint('crypto', __name__, url_prefix='/api/crypto')
_svc = CryptoService()
_auth = AuthService()


@crypto_bp.get('/deposit-address')
@auth_required
def deposit_address():
    try:
        data = _svc.get_or_create_deposit_address(g.current_user['id'])
        return jsonify({'ok': True, 'data': data})
    except Exception as exc:
        return api_error(str(exc))


@crypto_bp.get('/deposits')
@auth_required
def list_deposits():
    try:
        data = _svc.list_deposits(g.current_user['id'])
        return jsonify({'ok': True, 'data': data})
    except Exception as exc:
        return api_error(str(exc))


@crypto_bp.get('/events')
def sse_events():
    """Server-Sent Events — EventSource passes token via ?t= query param."""
    # EventSource doesn't support custom headers, so we read token from query string
    token = (request.args.get('t') or '').strip()
    if not token:
        return api_error('Потрібна авторизація.', 401)
    user = _auth.get_user_by_token(token)
    if not user:
        return api_error('Недійсна або прострочена сесія.', 401)

    user_id = user['id']
    q = subscribe_sse(user_id)

    @stream_with_context
    def generate():
        # Initial heartbeat so the browser knows the connection is alive
        yield 'event: connected\ndata: {}\n\n'
        try:
            while True:
                try:
                    event = q.get(timeout=25)
                    payload = json.dumps(event, ensure_ascii=False)
                    yield f'event: {event["type"]}\ndata: {payload}\n\n'
                except Exception:
                    # Heartbeat every 25 sec to keep the connection alive
                    yield ': heartbeat\n\n'
        finally:
            unsubscribe_sse(user_id, q)

    return Response(
        generate(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
        },
    )
