"""Маршрути користувачів."""
from __future__ import annotations

from flask import Blueprint, g, jsonify, request

from ..repositories.user_repository import UserRepository
from .helpers import api_error, auth_required, role_required

user_bp = Blueprint('users', __name__, url_prefix='/api/users')
user_repo = UserRepository()


@user_bp.get('/search')
@auth_required
def search():
    q = (request.args.get('q') or '').strip()
    if len(q) < 2:
        return api_error('Запит має бути не коротшим за 2 символи.')
    users = user_repo.search(q, exclude_id=g.current_user['id'])
    return jsonify({'ok': True, 'data': users})


@user_bp.get('/<int:user_id>')
@auth_required
def get_user(user_id: int):
    user = user_repo.get_by_id(user_id)
    if not user:
        return api_error('Користувача не знайдено.', 404)
    safe = {k: user[k] for k in ('id', 'full_name', 'phone', 'email', 'role', 'is_online', 'last_seen_at')}
    return jsonify({'ok': True, 'data': safe})


@user_bp.get('')
@auth_required
@role_required('admin')
def list_users():
    limit = min(int(request.args.get('limit', 50)), 200)
    offset = int(request.args.get('offset', 0))
    users = user_repo.list_users(limit=limit, offset=offset)
    return jsonify({'ok': True, 'data': users})
