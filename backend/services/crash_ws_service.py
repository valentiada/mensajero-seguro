"""Мультиплеєрний Crash — ігровий цикл на базі Socket.IO + eventlet."""
from __future__ import annotations

import random
import time
from typing import Any

# ── Game constants ────────────────────────────────────────────────────────────

WAITING_SECS = 7.0    # betting window before each round
CRASHED_SECS = 3.0    # pause after crash before next round
TICK_INTERVAL = 0.10  # seconds between multiplier updates
HOUSE_EDGE = 0.04     # 4 %

# ── Shared game state (one room for all) ─────────────────────────────────────

_state: dict[str, Any] = {
    'phase':    'waiting',   # 'waiting' | 'flying' | 'crashed'
    'mult':     1.0,
    'crash_at': None,        # hidden until crash
    'started_at': 0.0,
    'waiting_until': 0.0,
    'bets':     {},          # user_id -> {name, amount, sid}
    'cashouts': {},          # user_id -> {mult, win, name}
    'round_id': 0,
}

# ── Crash-point generation ────────────────────────────────────────────────────

def _gen_crash_at() -> float:
    """Geometric distribution; ~4 % house edge."""
    r = random.random()
    if r < HOUSE_EDGE:
        return 1.0   # instant crash (~4 % of rounds)
    return max(1.0, round((1 - HOUSE_EDGE) / (1 - r), 2))


# ── Multiplier formula (same as client) ──────────────────────────────────────

def _calc_mult(elapsed: float) -> float:
    """1.04 ^ (elapsed * 10) — grows ~4 %/second of game time."""
    return round(1.04 ** (elapsed * 10), 2)


# ── Public API ────────────────────────────────────────────────────────────────

def get_state_snapshot() -> dict:
    s = _state
    return {
        'phase':         s['phase'],
        'mult':          s['mult'],
        'waiting_until': s['waiting_until'],
        'round_id':      s['round_id'],
        'bets':   [{'name': v['name'], 'amount': v['amount']}
                   for v in s['bets'].values()],
        'cashouts': [{'name': v['name'], 'mult': v['mult'], 'win': v['win']}
                     for v in s['cashouts'].values()],
    }


def place_bet(user_id: int, name: str, sid: str, amount: float) -> str | None:
    """Returns error string or None on success."""
    if _state['phase'] != 'waiting':
        return 'Ставки тільки у фазі очікування.'
    if user_id in _state['bets']:
        return 'Ставку вже зроблено.'
    if amount <= 0:
        return 'Невірна ставка.'
    _state['bets'][user_id] = {'name': name, 'amount': amount, 'sid': sid}
    return None


def cashout(user_id: int) -> dict | str:
    """Returns result dict or error string."""
    if _state['phase'] != 'flying':
        return 'Забрати можна тільки під час польоту.'
    if user_id not in _state['bets']:
        return 'Ставку не знайдено.'
    if user_id in _state['cashouts']:
        return 'Вже забрали.'
    bet = _state['bets'][user_id]
    mult = _state['mult']
    win = round(bet['amount'] * mult, 2)
    _state['cashouts'][user_id] = {'mult': mult, 'win': win, 'name': bet['name']}
    return {'mult': mult, 'win': win, 'bet': bet['amount']}


# ── Background game loop ──────────────────────────────────────────────────────

def start_loop(sio) -> None:  # type: ignore[type-arg]
    sio.start_background_task(_game_loop, sio)


def _game_loop(sio) -> None:  # type: ignore[type-arg]
    import eventlet

    while True:
        # ── WAITING phase ─────────────────────────────────────────────────
        _state['phase'] = 'waiting'
        _state['mult'] = 1.0
        _state['crash_at'] = _gen_crash_at()
        _state['bets'] = {}
        _state['cashouts'] = {}
        _state['round_id'] += 1
        _state['waiting_until'] = time.time() + WAITING_SECS

        sio.emit('phase', {
            'phase': 'waiting',
            'waiting_until': _state['waiting_until'],
            'round_id': _state['round_id'],
        }, namespace='/crash')

        eventlet.sleep(WAITING_SECS)

        # ── FLYING phase ──────────────────────────────────────────────────
        _state['phase'] = 'flying'
        _state['started_at'] = time.time()
        crash_at = _state['crash_at']

        sio.emit('phase', {'phase': 'flying', 'round_id': _state['round_id']},
                 namespace='/crash')

        while True:
            elapsed = time.time() - _state['started_at']
            mult = _calc_mult(elapsed)
            _state['mult'] = mult

            sio.emit('tick', {'mult': mult}, namespace='/crash')

            if mult >= crash_at:
                break
            eventlet.sleep(TICK_INTERVAL)

        # ── CRASHED phase ─────────────────────────────────────────────────
        _state['phase'] = 'crashed'
        _state['mult'] = crash_at

        # Build results for players who did NOT cashout
        lost = []
        for uid, bet in _state['bets'].items():
            if uid not in _state['cashouts']:
                lost.append({'name': bet['name'], 'amount': bet['amount']})

        sio.emit('crashed', {
            'crash_at': crash_at,
            'cashouts': [
                {'name': v['name'], 'mult': v['mult'], 'win': v['win']}
                for v in _state['cashouts'].values()
            ],
            'lost': lost,
            'round_id': _state['round_id'],
        }, namespace='/crash')

        eventlet.sleep(CRASHED_SECS)
