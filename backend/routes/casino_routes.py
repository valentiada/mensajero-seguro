"""Маршрути казино."""
from __future__ import annotations

import re
from datetime import date, datetime, timezone

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


# ── Daily bonus ───────────────────────────────────────────────────────────────

_BONUS_AMOUNTS = [50, 100, 200, 300, 500, 750, 1000]  # day 1..7, then cycles at 1000


def _daily_bonus_status(user_id: int) -> dict:
    today = date.today().isoformat()
    last = query_one(
        'SELECT * FROM daily_bonus_claims WHERE user_id = ? ORDER BY id DESC LIMIT 1',
        (user_id,),
    )
    if last:
        last_date = last['claimed_at'][:10]
        if last_date == today:
            # Already claimed today
            streak = last['streak_day']
            next_day = min(streak + 1, len(_BONUS_AMOUNTS))
            return {
                'claimed_today': True,
                'streak': streak,
                'next_amount': _BONUS_AMOUNTS[next_day - 1],
                'days': _build_days(streak),
            }
        from datetime import date as _d, timedelta
        yesterday = (_d.today() - timedelta(days=1)).isoformat()
        if last_date == yesterday:
            streak = min(last['streak_day'] + 1, len(_BONUS_AMOUNTS))
        else:
            streak = 1  # streak broken
    else:
        streak = 1

    amount = _BONUS_AMOUNTS[streak - 1]
    return {
        'claimed_today': False,
        'streak': streak,
        'next_amount': amount,
        'days': _build_days(streak - 1),
    }


def _build_days(current_streak: int) -> list[dict]:
    return [
        {
            'day': i + 1,
            'amount': _BONUS_AMOUNTS[i],
            'claimed': i < current_streak,
            'today': i == current_streak,
        }
        for i in range(len(_BONUS_AMOUNTS))
    ]


@casino_bp.get('/daily-bonus')
@auth_required
def daily_bonus_status():
    return jsonify({'ok': True, 'data': _daily_bonus_status(g.current_user['id'])})


@casino_bp.post('/daily-bonus/claim')
@auth_required
@rate_limit(3, 86400, key_func=lambda: f'daily:{g.current_user["id"]}')
def claim_daily_bonus():
    user_id = g.current_user['id']
    status = _daily_bonus_status(user_id)
    if status['claimed_today']:
        return api_error('Бонус вже отримано сьогодні.')
    streak = status['streak']
    amount = _BONUS_AMOUNTS[streak - 1]
    execute(
        'INSERT INTO daily_bonus_claims (user_id, streak_day, amount) VALUES (?, ?, ?)',
        (user_id, streak, amount),
    )
    new_balance = casino_service.repo.update_balance(user_id, amount)
    execute(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        (user_id, 'daily_bonus', f'streak={streak} amount={amount}'),
    )
    return jsonify({'ok': True, 'data': {
        'amount': amount, 'streak': streak, 'new_balance': new_balance,
        **_daily_bonus_status(user_id),
    }})


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


@casino_bp.post('/fiat-deposit')
@auth_required
@rate_limit(5, 60, key_func=_casino_rate_key)
def fiat_deposit():
    """Demo fiat deposit — simulates card payment, credits balance immediately."""
    data = request.get_json(force=True) or {}
    try:
        amount = float(data.get('amount', 0))
    except (TypeError, ValueError):
        return api_error('Невірна сума.')

    if amount < 10:
        return api_error('Мінімальна сума поповнення: 10 USDT.')
    if amount > 10000:
        return api_error('Максимальна сума: 10 000 USDT.')

    card = (data.get('card') or '').replace(' ', '')
    if len(card) < 13 or not card.isdigit():
        return api_error('Невірний номер картки.')

    new_balance = casino_service.repo.update_balance(g.current_user['id'], amount)
    execute(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        (g.current_user['id'], 'fiat_deposit', f'amount={amount} card=****{card[-4:]}'),
    )
    return jsonify({'ok': True, 'data': {
        'amount': amount,
        'new_balance': new_balance,
        'card_last4': card[-4:],
        'message': f'Зараховано {amount:.2f} USDT на баланс.',
    }})


# ── Blackjack ─────────────────────────────────────────────────────────────────

@casino_bp.post('/blackjack/start')
@auth_required
@rate_limit(20, 10, key_func=_casino_rate_key)
def blackjack_start():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
    except (TypeError, ValueError):
        return api_error('Невірна ставка.')
    try:
        result = casino_service.start_blackjack(g.current_user['id'], bet)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


@casino_bp.post('/blackjack/action')
@auth_required
def blackjack_action():
    data = request.get_json(force=True) or {}
    session_id = (data.get('session_id') or '').strip()
    action = (data.get('action') or '').strip()
    if not session_id:
        return api_error('session_id обовʼязковий.')
    if action not in ('hit', 'stand', 'double'):
        return api_error('Дія: hit, stand або double.')
    try:
        result = casino_service.action_blackjack(g.current_user['id'], session_id, action)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Baccarat ──────────────────────────────────────────────────────────────────

@casino_bp.post('/baccarat/play')
@auth_required
@rate_limit(30, 10, key_func=_casino_rate_key)
def baccarat_play():
    data = request.get_json(force=True) or {}
    bet_type = (data.get('bet_type') or '').strip()
    try:
        amount = float(data.get('amount', 10))
    except (TypeError, ValueError):
        return api_error('Невірна ставка.')
    try:
        result = casino_service.play_baccarat(g.current_user['id'], bet_type, amount)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Plinko ────────────────────────────────────────────────────────────────────

@casino_bp.post('/plinko/drop')
@auth_required
@rate_limit(30, 10, key_func=_casino_rate_key)
def plinko_drop():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
        rows = int(data.get('rows', 8))
    except (TypeError, ValueError):
        return api_error('Невірні параметри.')
    risk = (data.get('risk') or 'medium').strip()
    try:
        result = casino_service.play_plinko(g.current_user['id'], bet, rows, risk)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Limbo ─────────────────────────────────────────────────────────────────────

@casino_bp.post('/limbo/play')
@auth_required
@rate_limit(30, 10, key_func=_casino_rate_key)
def limbo_play():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
        target = float(data.get('target', 2.0))
    except (TypeError, ValueError):
        return api_error('Невірні параметри.')
    try:
        result = casino_service.play_limbo(g.current_user['id'], bet, target)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Wheel ─────────────────────────────────────────────────────────────────────

@casino_bp.post('/wheel/spin')
@auth_required
@rate_limit(30, 10, key_func=_casino_rate_key)
def wheel_spin():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
        segments = int(data.get('segments', 30))
    except (TypeError, ValueError):
        return api_error('Невірні параметри.')
    risk = (data.get('risk') or 'medium').strip()
    try:
        result = casino_service.play_wheel(g.current_user['id'], bet, risk, segments)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Hilo ──────────────────────────────────────────────────────────────────────

@casino_bp.post('/hilo/start')
@auth_required
@rate_limit(20, 10, key_func=_casino_rate_key)
def hilo_start():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
    except (TypeError, ValueError):
        return api_error('Невірна ставка.')
    try:
        result = casino_service.start_hilo(g.current_user['id'], bet)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


@casino_bp.post('/hilo/guess')
@auth_required
def hilo_guess():
    data = request.get_json(force=True) or {}
    session_id = (data.get('session_id') or '').strip()
    guess = (data.get('guess') or '').strip()
    if not session_id:
        return api_error('session_id обовʼязковий.')
    if guess not in ('higher', 'lower', 'equal'):
        return api_error('guess: higher, lower або equal.')
    try:
        result = casino_service.guess_hilo(g.current_user['id'], session_id, guess)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


@casino_bp.post('/hilo/cashout')
@auth_required
def hilo_cashout():
    data = request.get_json(force=True) or {}
    session_id = (data.get('session_id') or '').strip()
    if not session_id:
        return api_error('session_id обовʼязковий.')
    try:
        result = casino_service.cashout_hilo(g.current_user['id'], session_id)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Tower ─────────────────────────────────────────────────────────────────────

@casino_bp.post('/tower/start')
@auth_required
@rate_limit(20, 10, key_func=_casino_rate_key)
def tower_start():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
    except (TypeError, ValueError):
        return api_error('Невірна ставка.')
    difficulty = (data.get('difficulty') or 'medium').strip()
    try:
        result = casino_service.start_tower(g.current_user['id'], bet, difficulty)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


@casino_bp.post('/tower/pick')
@auth_required
def tower_pick():
    data = request.get_json(force=True) or {}
    session_id = (data.get('session_id') or '').strip()
    try:
        col = int(data.get('col', -1))
    except (TypeError, ValueError):
        return api_error('Невірна колонка.')
    if not session_id:
        return api_error('session_id обовʼязковий.')
    try:
        result = casino_service.pick_tower(g.current_user['id'], session_id, col)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


@casino_bp.post('/tower/cashout')
@auth_required
def tower_cashout():
    data = request.get_json(force=True) or {}
    session_id = (data.get('session_id') or '').strip()
    if not session_id:
        return api_error('session_id обовʼязковий.')
    try:
        result = casino_service.cashout_tower(g.current_user['id'], session_id)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Keno ──────────────────────────────────────────────────────────────────────

@casino_bp.post('/keno/play')
@auth_required
@rate_limit(30, 10, key_func=_casino_rate_key)
def keno_play():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
    except (TypeError, ValueError):
        return api_error('Невірна ставка.')
    picks = data.get('picks') or []
    try:
        picks = [int(p) for p in picks]
    except (TypeError, ValueError):
        return api_error('Невірні числа.')
    try:
        result = casino_service.play_keno(g.current_user['id'], bet, picks)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Video Poker ───────────────────────────────────────────────────────────────

@casino_bp.post('/videopoker/deal')
@auth_required
@rate_limit(20, 10, key_func=_casino_rate_key)
def vp_deal():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
    except (TypeError, ValueError):
        return api_error('Невірна ставка.')
    try:
        result = casino_service.deal_video_poker(g.current_user['id'], bet)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


@casino_bp.post('/videopoker/draw')
@auth_required
def vp_draw():
    data = request.get_json(force=True) or {}
    session_id = (data.get('session_id') or '').strip()
    hold = data.get('hold') or []
    if not session_id:
        return api_error('session_id обовʼязковий.')
    try:
        hold = [int(h) for h in hold]
    except (TypeError, ValueError):
        return api_error('hold: список індексів 0–4.')
    try:
        result = casino_service.draw_video_poker(g.current_user['id'], session_id, hold)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Dragon Tiger ──────────────────────────────────────────────────────────────

@casino_bp.post('/dragontiger/play')
@auth_required
@rate_limit(30, 10, key_func=_casino_rate_key)
def dragon_tiger_play():
    data = request.get_json(force=True) or {}
    side = (data.get('side') or '').strip()
    try:
        bet = float(data.get('bet', 10))
    except (TypeError, ValueError):
        return api_error('Невірна ставка.')
    try:
        result = casino_service.play_dragon_tiger(g.current_user['id'], bet, side)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))


# ── Scratch Card ──────────────────────────────────────────────────────────────

@casino_bp.post('/scratch/play')
@auth_required
@rate_limit(30, 10, key_func=_casino_rate_key)
def scratch_play():
    data = request.get_json(force=True) or {}
    try:
        bet = float(data.get('bet', 10))
    except (TypeError, ValueError):
        return api_error('Невірна ставка.')
    try:
        result = casino_service.play_scratch(g.current_user['id'], bet)
        return jsonify({'ok': True, 'data': result})
    except ValueError as exc:
        return api_error(str(exc))
