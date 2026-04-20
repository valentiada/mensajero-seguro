"""Адмін-маршрути: статистика, управління юзерами, ігри, конфіг."""
from __future__ import annotations

from flask import Blueprint, g, jsonify, request

from ..database import execute, query_all, query_one
from ..config import USE_PG
from .helpers import api_error, auth_required, role_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


# ── Stats ─────────────────────────────────────────────────────────────────────

@admin_bp.get('/stats')
@auth_required
@role_required('admin', 'operator')
def stats():
    now_sql = 'NOW()' if USE_PG else "datetime('now')"
    today_sql = "DATE('now')" if not USE_PG else "CURRENT_DATE"

    total_users = (query_one('SELECT COUNT(*) AS c FROM users') or {}).get('c', 0)

    active_today = (query_one(
        f"SELECT COUNT(*) AS c FROM users WHERE DATE(last_seen_at) = {today_sql}"
    ) or {}).get('c', 0)

    wallet_agg = query_one(
        'SELECT COALESCE(SUM(total_bet),0) AS tw, COALESCE(SUM(total_won),0) AS ww FROM casino_wallets'
    ) or {}
    total_wagered = float(wallet_agg.get('tw') or 0)
    total_won_val = float(wallet_agg.get('ww') or 0)
    edge = round((total_wagered - total_won_val) / total_wagered * 100, 2) if total_wagered else 0.0

    dep_agg = query_one(
        "SELECT COALESCE(SUM(amount_usdt),0) AS td FROM crypto_deposits WHERE status='confirmed'"
    ) or {}
    total_deposits = float(dep_agg.get('td') or 0)

    dep_today = query_one(
        f"SELECT COALESCE(SUM(amount_usdt),0) AS td FROM crypto_deposits WHERE status='confirmed' AND DATE(created_at)={today_sql}"
    ) or {}
    deposits_today = float((dep_today.get('td') or 0))

    games_today = (query_one(
        f"SELECT COUNT(*) AS c FROM casino_games WHERE DATE(created_at)={today_sql}"
    ) or {}).get('c', 0)

    pending_dep = (query_one(
        "SELECT COUNT(*) AS c FROM crypto_deposits WHERE status='pending'"
    ) or {}).get('c', 0)

    return jsonify({'ok': True, 'data': {
        'total_users': total_users,
        'active_today': active_today,
        'total_deposits_usdt': total_deposits,
        'deposits_today': deposits_today,
        'total_wagered': total_wagered,
        'total_won': total_won_val,
        'house_edge_pct': edge,
        'games_today': games_today,
        'pending_deposits': pending_dep,
    }})


# ── Users management ──────────────────────────────────────────────────────────

@admin_bp.get('/users')
@auth_required
@role_required('admin', 'operator')
def list_users():
    limit = min(int(request.args.get('limit', 200)), 500)
    rows = query_all(
        '''SELECT u.id, u.full_name, u.phone, u.email, u.role,
                  COALESCE(w.balance, 0) AS balance
           FROM users u
           LEFT JOIN casino_wallets w ON w.user_id = u.id
           ORDER BY u.id DESC LIMIT ?''',
        (limit,),
    )
    return jsonify({'ok': True, 'data': {'users': rows}})


@admin_bp.put('/users/<int:user_id>/role')
@auth_required
@role_required('admin')
def set_role(user_id: int):
    data = request.get_json(force=True) or {}
    role = data.get('role', '').strip()
    allowed = {'soldier', 'operator', 'admin', 'banned'}
    if role not in allowed:
        return api_error(f'Невірна роль. Допустимо: {allowed}')
    # Protect: cannot demote yourself
    if user_id == g.current_user['id'] and role != 'admin':
        return api_error('Не можна змінити власну роль.')
    execute('UPDATE users SET role = ? WHERE id = ?', (role, user_id))
    return jsonify({'ok': True})


@admin_bp.post('/users/<int:user_id>/ban')
@auth_required
@role_required('admin', 'operator')
def ban_user(user_id: int):
    if user_id == g.current_user['id']:
        return api_error('Не можна заблокувати себе.')
    execute("UPDATE users SET role = 'banned' WHERE id = ?", (user_id,))
    return jsonify({'ok': True})


@admin_bp.post('/users/<int:user_id>/unban')
@auth_required
@role_required('admin', 'operator')
def unban_user(user_id: int):
    execute("UPDATE users SET role = 'soldier' WHERE id = ? AND role = 'banned'", (user_id,))
    return jsonify({'ok': True})


# ── Win history ───────────────────────────────────────────────────────────────

@admin_bp.get('/wins')
@auth_required
@role_required('admin', 'operator')
def wins():
    game = request.args.get('game', 'all').strip()
    limit = min(int(request.args.get('limit', 200)), 500)

    if game and game != 'all':
        rows = query_all(
            '''SELECT g.*, u.full_name AS user_name FROM casino_games g
               JOIN users u ON u.id = g.user_id
               WHERE g.game_type = ? ORDER BY g.created_at DESC LIMIT ?''',
            (game, limit),
        )
    else:
        rows = query_all(
            '''SELECT g.*, u.full_name AS user_name FROM casino_games g
               JOIN users u ON u.id = g.user_id
               ORDER BY g.created_at DESC LIMIT ?''',
            (limit,),
        )
    return jsonify({'ok': True, 'data': rows})


# ── Payments ──────────────────────────────────────────────────────────────────

@admin_bp.get('/payments')
@auth_required
@role_required('admin', 'operator')
def payments():
    status = request.args.get('status', 'all').strip()
    limit = min(int(request.args.get('limit', 200)), 500)

    if status and status != 'all':
        rows = query_all(
            '''SELECT d.*, u.full_name AS user_name FROM crypto_deposits d
               JOIN users u ON u.id = d.user_id
               WHERE d.status = ? ORDER BY d.created_at DESC LIMIT ?''',
            (status, limit),
        )
    else:
        rows = query_all(
            '''SELECT d.*, u.full_name AS user_name FROM crypto_deposits d
               JOIN users u ON u.id = d.user_id
               ORDER BY d.created_at DESC LIMIT ?''',
            (limit,),
        )
    return jsonify({'ok': True, 'data': rows})


@admin_bp.post('/payments/adjust')
@auth_required
@role_required('admin')
def adjust_balance():
    data = request.get_json(force=True) or {}
    user_id = data.get('user_id')
    amount = data.get('amount')
    note = data.get('note', 'Manual adjustment').strip()

    if not user_id or amount is None:
        return api_error('user_id та amount обовʼязкові.')
    try:
        user_id = int(user_id)
        amount = float(amount)
    except (TypeError, ValueError):
        return api_error('Невірні параметри.')

    # Ensure wallet exists
    existing = query_one('SELECT id FROM casino_wallets WHERE user_id = ?', (user_id,))
    if not existing:
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        execute(
            f'INSERT INTO casino_wallets (user_id, balance) VALUES (?, ?)',
            (user_id, max(0.0, amount)),
        )
    else:
        execute(
            'UPDATE casino_wallets SET balance = MAX(0, balance + ?) WHERE user_id = ?',
            (amount, user_id),
        )

    # Audit log
    execute(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        (g.current_user['id'], 'balance_adjust', f'target={user_id} amount={amount} note={note}'),
    )
    return jsonify({'ok': True})


# ── Game config ───────────────────────────────────────────────────────────────

# Stored in-memory (in production: persist to DB or Redis)
_GAME_CONFIG: dict = {
    'roulette_house_edge': 2.7,
    'slots_rtp': 95.0,
    'crash_house_edge': 4.0,
    'mines_house_edge': 3.0,
    'dice_house_edge': 2.0,
    'chicken_house_edge': 3.5,
    'max_bet': 10000.0,
    'min_bet': 1.0,
    'instant_deposit_limit': 500.0,
    'deposit_credit_confirmations': 1,
    'deposit_full_confirmations': 15,
}


@admin_bp.get('/config')
@auth_required
@role_required('admin', 'operator')
def get_config():
    return jsonify({'ok': True, 'data': _GAME_CONFIG})


@admin_bp.put('/config')
@auth_required
@role_required('admin')
def set_config():
    data = request.get_json(force=True) or {}
    allowed_keys = set(_GAME_CONFIG.keys())
    for k, v in data.items():
        if k in allowed_keys:
            try:
                _GAME_CONFIG[k] = type(_GAME_CONFIG[k])(v)
            except (TypeError, ValueError):
                pass

    execute(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        (g.current_user['id'], 'config_update', str(data)[:500]),
    )
    return jsonify({'ok': True, 'data': _GAME_CONFIG})


# ── Withdrawals ───────────────────────────────────────────────────────────────

@admin_bp.get('/withdrawals')
@auth_required
@role_required('admin', 'operator')
def list_withdrawals():
    status = request.args.get('status', 'pending')
    rows = query_all(
        '''SELECT w.*, u.full_name, u.phone, u.email
           FROM withdrawals w JOIN users u ON u.id = w.user_id
           WHERE w.status = ?
           ORDER BY w.id DESC LIMIT 100''',
        (status,),
    )
    return jsonify({'ok': True, 'data': rows})


@admin_bp.post('/withdrawals/<int:wd_id>/process')
@auth_required
@role_required('admin')
def process_withdrawal(wd_id: int):
    data = request.get_json(force=True) or {}
    action = (data.get('action') or '').strip()      # 'approve' | 'reject'
    tx_hash = (data.get('tx_hash') or '').strip()

    if action not in ('approve', 'reject'):
        return api_error("action має бути 'approve' або 'reject'.")

    wd = query_one('SELECT * FROM withdrawals WHERE id = ?', (wd_id,))
    if not wd:
        return api_error('Заявку не знайдено.')
    if wd['status'] != 'pending':
        return api_error(f"Заявка вже в статусі '{wd['status']}'.")

    now_sql = 'NOW()' if USE_PG else "datetime('now')"
    if action == 'approve':
        if not tx_hash:
            return api_error('tx_hash обовʼязковий для approve.')
        execute(
            f"UPDATE withdrawals SET status='done', tx_hash=?, processed_at={now_sql} WHERE id=?",
            (tx_hash, wd_id),
        )
        new_status = 'done'
    else:
        # Reject: refund balance
        execute(
            f"UPDATE withdrawals SET status='rejected', processed_at={now_sql} WHERE id=?",
            (wd_id,),
        )
        total_refund = float(wd['amount_usdt']) + 1.0  # amount + fee
        execute(
            'UPDATE casino_wallets SET balance = balance + ? WHERE user_id = ?',
            (total_refund, wd['user_id']),
        )
        execute(
            'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
            (g.current_user['id'], 'withdrawal_rejected',
             f'wd_id={wd_id} refund={total_refund}'),
        )
        new_status = 'rejected'

    execute(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        (g.current_user['id'], f'withdrawal_{action}',
         f'wd_id={wd_id} tx_hash={tx_hash or "-"}'),
    )
    return jsonify({'ok': True, 'data': {'id': wd_id, 'status': new_status}})
