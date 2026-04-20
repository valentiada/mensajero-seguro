"""Допоміжні функції для маршрутів Flask."""
from __future__ import annotations

import threading
import time
from collections import defaultdict, deque
from functools import wraps

from flask import after_this_request, current_app, g, jsonify, request

from ..config import AUTH_RATE_LIMIT_ENABLED, ENABLE_RATE_LIMIT_IN_TESTS
from ..services.auth_service import AuthService
from ..utils.security import should_refresh_session

auth_service = AuthService()

_RATE_LOCK = threading.Lock()
_RATE_BUCKETS: dict[str, deque[float]] = defaultdict(deque)


def api_error(message: str, status: int = 400):
    return jsonify({'ok': False, 'error': message}), status


def _client_ip() -> str:
    xff = (request.headers.get('X-Forwarded-For') or '').strip()
    return (xff.split(',')[0].strip() if xff else request.remote_addr or 'unknown')[:80]


def auth_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '):
            return api_error('Потрібна авторизація.', 401)
        token = header[7:].strip()
        user = auth_service.get_user_by_token(token)
        if not user:
            return api_error('Недійсна або прострочена сесія.', 401)

        g.current_user = user
        g.current_token = token

        try:
            from ..database import get_connection
            from ..config import USE_PG
            with get_connection() as conn:
                now_sql = 'NOW()' if USE_PG else "datetime('now')"
                conn.execute(f'UPDATE users SET last_seen_at = {now_sql} WHERE id = ?', (user['id'],))
        except Exception:
            pass

        if should_refresh_session(user.get('expires_at', '')):
            new_token = auth_service.refresh_session(token)
            if new_token:
                @after_this_request
                def _add_header(response):
                    response.headers['X-Refresh-Token'] = new_token
                    existing = (response.headers.get('Access-Control-Expose-Headers') or '').strip()
                    parts = [p.strip() for p in existing.split(',') if p.strip()]
                    if 'X-Refresh-Token' not in parts:
                        parts.append('X-Refresh-Token')
                    response.headers['Access-Control-Expose-Headers'] = ', '.join(parts)
                    return response

        return func(*args, **kwargs)
    return wrapper


def role_required(*allowed_roles: str):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user = getattr(g, 'current_user', None)
            if not user:
                return api_error('Потрібна авторизація.', 401)
            if user.get('role') not in allowed_roles:
                return api_error('Доступ заборонено.', 403)
            return func(*args, **kwargs)
        return wrapper
    return decorator


def rate_limit(limit: int, window_seconds: int, key_func=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if (
                (current_app.testing and not ENABLE_RATE_LIMIT_IN_TESTS)
                or not AUTH_RATE_LIMIT_ENABLED
                or limit <= 0
            ):
                return func(*args, **kwargs)

            key = key_func() if key_func else f'{_client_ip()}:{request.path}'
            now = time.time()
            cutoff = now - window_seconds

            with _RATE_LOCK:
                bucket = _RATE_BUCKETS[key]
                while bucket and bucket[0] <= cutoff:
                    bucket.popleft()
                if len(bucket) >= limit:
                    retry_after = max(1, int(window_seconds - (now - bucket[0])))
                    resp = jsonify({'ok': False, 'error': 'Забагато запитів. Спробуйте пізніше.'})
                    resp.status_code = 429
                    resp.headers['Retry-After'] = str(retry_after)
                    return resp
                bucket.append(now)

            return func(*args, **kwargs)
        return wrapper
    return decorator
