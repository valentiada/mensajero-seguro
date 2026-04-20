"""Маршрути казино."""
from __future__ import annotations

from flask import Blueprint, g, jsonify, request

from ..services.casino_service import CasinoService
from .helpers import api_error, auth_required, rate_limit

casino_bp = Blueprint('casino', __name__, url_prefix='/api/casino')
casino_service = CasinoService()


def _casino_rate_key():
    return f'casino:{g.current_user["id"]}'


@casino_bp.get('/profile')
@auth_required
def get_profile():
    try:
        data = casino_service.get_profile(g.current_user['id'])
        return jsonify({'ok': True, 'data': data})
    except Exception as exc:
        return api_error(str(exc))


@casino_bp.get('/leaderboard')
@auth_required
def leaderboard():
    try:
        data = casino_service.get_leaderboard()
        return jsonify({'ok': True, 'data': data})
    except Exception as exc:
        return api_error(str(exc))


@casino_bp.post('/roulette/spin')
@auth_required
@rate_limit(30, 10, key_func=_casino_rate_key)
def roulette_spin():
    data = request.get_json(force=True) or {}
    bets = data.get('bets') or []
    if not bets:
        return api_error('Потрібно зробити хоча б одну ставку.')
    try:
        result = casino_service.spin_roulette(g.current_user['id'], bets)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))
    except Exception as exc:
        return api_error(str(exc))


@casino_bp.post('/slots/spin')
@auth_required
@rate_limit(30, 10, key_func=_casino_rate_key)
def slots_spin():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
    except (TypeError, ValueError):
        return api_error('Невірна ставка.')
    try:
        result = casino_service.spin_slots(g.current_user['id'], bet)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))
    except Exception as exc:
        return api_error(str(exc))
