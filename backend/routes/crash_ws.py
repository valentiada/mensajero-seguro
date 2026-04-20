"""Socket.IO namespace /crash — мультиплеєрний Crash."""
from __future__ import annotations

from flask import request
from flask_socketio import Namespace, emit

from ..repositories.casino_repository import CasinoRepository
from ..routes.helpers import decode_token
from ..services.crash_ws_service import cashout, get_state_snapshot, place_bet

_repo = CasinoRepository()

MIN_BET = 1.0
MAX_BET = 10_000.0


class CrashNamespace(Namespace):
    def on_connect(self, auth):
        token = (auth or {}).get('token', '')
        user = decode_token(token) if token else None
        if not user:
            return False  # reject connection
        # Send current state immediately
        emit('state', get_state_snapshot())

    def on_place_bet(self, data):
        token = (data or {}).get('token', '')
        user = decode_token(token) if token else None
        if not user:
            emit('error', {'msg': 'Unauthorized'}); return

        try:
            amount = float(data.get('amount', 0))
        except (TypeError, ValueError):
            emit('error', {'msg': 'Невірна ставка.'}); return

        if amount < MIN_BET or amount > MAX_BET:
            emit('error', {'msg': f'Ставка: {MIN_BET}–{MAX_BET}.'}); return

        wallet = _repo.ensure_wallet(user['id'])
        if wallet['balance'] < amount:
            emit('error', {'msg': 'Недостатньо коштів.'}); return

        err = place_bet(user['id'], user['full_name'], request.sid, amount)
        if err:
            emit('error', {'msg': err}); return

        # Deduct balance
        _repo.update_balance(user['id'], -amount)

        self.emit('bet_placed', {
            'name': user['full_name'],
            'amount': amount,
        }, namespace='/crash')

    def on_cashout(self, data):
        token = (data or {}).get('token', '')
        user = decode_token(token) if token else None
        if not user:
            emit('error', {'msg': 'Unauthorized'}); return

        result = cashout(user['id'])
        if isinstance(result, str):
            emit('error', {'msg': result}); return

        # Credit winnings
        new_balance = _repo.update_balance(user['id'], result['win'])
        _repo.add_bet_stats(user['id'], result['bet'], result['win'])
        xp = max(1, int(result['bet'] / 20))
        _repo.add_xp(user['id'], xp)
        if result['win'] >= 5000:
            _repo.unlock_achievement(user['id'], 'big_winner')
        _repo.upsert_leaderboard(user['id'], result['win'])
        _repo.save_game(user['id'], 'crash', result['bet'], result['win'], {
            'mult': result['mult'], 'multiplayer': True,
        })

        emit('cashed_out', {
            'mult': result['mult'],
            'win': result['win'],
            'new_balance': new_balance,
        })
        self.emit('player_cashed_out', {
            'name': user['full_name'],
            'mult': result['mult'],
            'win': result['win'],
        }, namespace='/crash')
