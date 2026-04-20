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


# ── Crash ─────────────────────────────────────────────────────────────────────

@casino_bp.post('/crash/start')
@auth_required
@rate_limit(20, 10, key_func=_casino_rate_key)
def crash_start():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
    except (TypeError, ValueError):
        return api_error('Невірна ставка.')
    try:
        result = casino_service.start_crash(g.current_user['id'], bet)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


@casino_bp.post('/crash/cashout')
@auth_required
def crash_cashout():
    data = request.get_json(force=True) or {}
    session_id = (data.get('session_id') or '').strip()
    try:
        mult = float(data.get('mult', 1.0))
    except (TypeError, ValueError):
        return api_error('Невірний множник.')
    if not session_id:
        return api_error('session_id обовʼязковий.')
    try:
        result = casino_service.cashout_crash(g.current_user['id'], session_id, mult)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Mines ─────────────────────────────────────────────────────────────────────

@casino_bp.post('/mines/start')
@auth_required
@rate_limit(20, 10, key_func=_casino_rate_key)
def mines_start():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
        mine_count = int(data.get('mine_count', 5))
    except (TypeError, ValueError):
        return api_error('Невірні параметри.')
    try:
        result = casino_service.start_mines(g.current_user['id'], bet, mine_count)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


@casino_bp.post('/mines/reveal')
@auth_required
def mines_reveal():
    data = request.get_json(force=True) or {}
    session_id = (data.get('session_id') or '').strip()
    try:
        tile = int(data.get('tile', -1))
    except (TypeError, ValueError):
        return api_error('Невірний індекс.')
    if not session_id:
        return api_error('session_id обовʼязковий.')
    try:
        result = casino_service.reveal_mines_tile(g.current_user['id'], session_id, tile)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


@casino_bp.post('/mines/cashout')
@auth_required
def mines_cashout():
    data = request.get_json(force=True) or {}
    session_id = (data.get('session_id') or '').strip()
    if not session_id:
        return api_error('session_id обовʼязковий.')
    try:
        result = casino_service.cashout_mines(g.current_user['id'], session_id)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Dice ──────────────────────────────────────────────────────────────────────

@casino_bp.post('/dice/roll')
@auth_required
@rate_limit(30, 10, key_func=_casino_rate_key)
def dice_roll():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
        target = int(data.get('target', 50))
        direction = str(data.get('direction', 'over')).strip()
    except (TypeError, ValueError):
        return api_error('Невірні параметри.')
    try:
        result = casino_service.roll_dice(g.current_user['id'], bet, target, direction)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Chicken Road ──────────────────────────────────────────────────────────────

@casino_bp.post('/chicken/start')
@auth_required
@rate_limit(20, 10, key_func=_casino_rate_key)
def chicken_start():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
    except (TypeError, ValueError):
        return api_error('Невірна ставка.')
    try:
        result = casino_service.start_chicken(g.current_user['id'], bet)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


@casino_bp.post('/chicken/step')
@auth_required
def chicken_step():
    data = request.get_json(force=True) or {}
    session_id = (data.get('session_id') or '').strip()
    if not session_id:
        return api_error('session_id обовʼязковий.')
    try:
        result = casino_service.step_chicken(g.current_user['id'], session_id)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


@casino_bp.post('/chicken/cashout')
@auth_required
def chicken_cashout():
    data = request.get_json(force=True) or {}
    session_id = (data.get('session_id') or '').strip()
    if not session_id:
        return api_error('session_id обовʼязковий.')
    try:
        result = casino_service.cashout_chicken(g.current_user['id'], session_id)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))
