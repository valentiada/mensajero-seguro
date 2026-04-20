"""Маршрути казино."""
from __future__ import annotations

import re

from flask import Blueprint, g, jsonify, request

from ..database import execute, query_all, query_one
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

@casino_bp.get('/dice/seed')
@auth_required
def dice_seed():
    data = casino_service.new_pf_seed()
    return jsonify({'ok': True, 'data': data})


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
    pf_session_id = (data.get('pf_session_id') or '').strip()
    client_seed = (data.get('client_seed') or '').strip()
    try:
        result = casino_service.roll_dice(
            g.current_user['id'], bet, target, direction, pf_session_id, client_seed,
        )
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


# ── Recent wins (public feed) ─────────────────────────────────────────────────

@casino_bp.get('/history')
@auth_required
def history():
    limit = min(int(request.args.get('limit', 50)), 200)
    offset = int(request.args.get('offset', 0))
    rows = query_all(
        'SELECT * FROM casino_games WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
        (g.current_user['id'], limit, offset),
    )
    import json as _json
    for r in rows:
        try:
            r['result_data'] = _json.loads(r.get('result_data') or '{}')
        except Exception:
            r['result_data'] = {}
    return jsonify({'ok': True, 'data': rows})


@casino_bp.get('/recent-wins')
def recent_wins():
    rows = query_all(
        '''SELECT g.game_type, g.win_amount, g.bet_amount,
                  u.full_name AS user_name
           FROM casino_games g
           JOIN users u ON u.id = g.user_id
           WHERE g.win_amount > 0
           ORDER BY g.id DESC LIMIT 40''',
    )
    return jsonify({'ok': True, 'data': rows})


# ── Withdrawals ───────────────────────────────────────────────────────────────

_BSC_ADDR_RE = re.compile(r'^0x[0-9a-fA-F]{40}$')
WITHDRAW_MIN = 5.0
WITHDRAW_FEE = 1.0   # flat USDT network fee


@casino_bp.post('/withdraw')
@auth_required
@rate_limit(3, 60, key_func=_casino_rate_key)
def withdraw():
    data = request.get_json(force=True) or {}
    try:
        amount = float(data.get('amount', 0))
    except (TypeError, ValueError):
        return api_error('Невірна сума.')
    address = (data.get('address') or '').strip()

    if amount < WITHDRAW_MIN:
        return api_error(f'Мінімальний вивід: {WITHDRAW_MIN} USDT.')
    if not _BSC_ADDR_RE.match(address):
        return api_error('Невірний BSC-адрес (0x…, 42 символи).')

    wallet = casino_service.repo.ensure_wallet(g.current_user['id'])
    total = amount + WITHDRAW_FEE
    if wallet['balance'] < total:
        return api_error(f'Недостатньо коштів. Потрібно {total} (сума + {WITHDRAW_FEE} комісія).')

    new_balance = casino_service.repo.update_balance(g.current_user['id'], -total)
    execute(
        'INSERT INTO withdrawals (user_id, amount_usdt, address, network) VALUES (?, ?, ?, ?)',
        (g.current_user['id'], amount, address, 'BSC'),
    )
    execute(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        (g.current_user['id'], 'withdraw_request',
         f'amount={amount} fee={WITHDRAW_FEE} address={address}'),
    )
    return jsonify({'ok': True, 'data': {
        'amount': amount, 'fee': WITHDRAW_FEE,
        'net': amount, 'new_balance': new_balance,
        'status': 'pending',
        'message': 'Заявка прийнята. Обробка 1-24 год.',
    }})


@casino_bp.get('/withdrawals')
@auth_required
def list_withdrawals():
    rows = query_all(
        'SELECT * FROM withdrawals WHERE user_id = ? ORDER BY id DESC LIMIT 20',
        (g.current_user['id'],),
    )
    return jsonify({'ok': True, 'data': rows})
