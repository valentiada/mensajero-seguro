"""Конфігурація WeeGo Messenger (з .env)."""
from __future__ import annotations

import json
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
_default_db_path = BASE_DIR / 'database' / 'messenger.db'
DATABASE_PATH = Path(os.getenv('MESSENGER_DATABASE_PATH', _default_db_path))
SCHEMA_PATH = BASE_DIR / 'database' / 'schema.sql'
SCHEMA_PG_PATH = BASE_DIR / 'database' / 'schema_pg.sql'

DATABASE_URL = os.getenv('DATABASE_URL', '').strip()
USE_PG = bool(DATABASE_URL)

SECRET_KEY = os.getenv('SECRET_KEY') or 'weego-messenger-demo-secret-key'
TOKEN_TTL_HOURS = int(os.getenv('TOKEN_TTL_HOURS', '720'))
DEBUG = os.getenv('DEBUG', '0') == '1'

BASE_PATH = os.getenv('BASE_PATH', '').rstrip('/')

ADMIN_EMAIL    = os.getenv('ADMIN_EMAIL', '').strip()
ADMIN_PHONE    = os.getenv('ADMIN_PHONE', '+380000000000').strip()
ADMIN_NAME     = os.getenv('ADMIN_NAME', 'System Admin').strip()
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', '').strip()

# ── Encryption ──────────────────────────────────────────────────────────────
MESSENGER_ENCRYPTION_KEYS = os.getenv('MESSENGER_ENCRYPTION_KEYS', '').strip()

# ── Calls / WebRTC ───────────────────────────────────────────────────────────
CALL_PENDING_TIMEOUT_SECONDS = int(os.getenv('CALL_PENDING_TIMEOUT_SECONDS', '45'))
CALL_ACTIVE_STALE_SECONDS = int(os.getenv('CALL_ACTIVE_STALE_SECONDS', '21600'))

_default_ice = [
    {'urls': 'stun:stun.l.google.com:19302'},
    {'urls': 'stun:stun1.l.google.com:19302'},
]
_ice_json = os.getenv('ICE_SERVERS', '').strip()
_turn_urls_raw = os.getenv('TURN_URLS', '').strip()
_turn_username = os.getenv('TURN_USERNAME', '').strip()
_turn_credential = os.getenv('TURN_CREDENTIAL', '').strip()

if _ice_json:
    try:
        _parsed = json.loads(_ice_json)
        ICE_SERVERS = _parsed if isinstance(_parsed, list) else _default_ice
    except Exception:
        ICE_SERVERS = _default_ice
else:
    _turn_urls = [u.strip() for u in _turn_urls_raw.split(',') if u.strip()]
    if _turn_urls and _turn_username and _turn_credential:
        ICE_SERVERS = [
            *_default_ice,
            {'urls': _turn_urls, 'username': _turn_username, 'credential': _turn_credential},
        ]
    else:
        ICE_SERVERS = _default_ice

# ── Rate limits ───────────────────────────────────────────────────────────────
AUTH_RATE_LIMIT_ENABLED = os.getenv('AUTH_RATE_LIMIT_ENABLED', '1') == '1'
AUTH_RATE_WINDOW_SECONDS = int(os.getenv('AUTH_RATE_WINDOW_SECONDS', '60'))
AUTH_LOGIN_RATE_LIMIT = int(os.getenv('AUTH_LOGIN_RATE_LIMIT', '12'))
AUTH_REGISTER_RATE_LIMIT = int(os.getenv('AUTH_REGISTER_RATE_LIMIT', '8'))
ENABLE_RATE_LIMIT_IN_TESTS = os.getenv('ENABLE_RATE_LIMIT_IN_TESTS', '0') == '1'

MSG_RATE_LIMIT = int(os.getenv('MSG_RATE_LIMIT', '60'))
MSG_RATE_WINDOW_SECONDS = int(os.getenv('MSG_RATE_WINDOW_SECONDS', '10'))

# ── Attachments ───────────────────────────────────────────────────────────────
MAX_ATTACHMENT_BYTES = int(os.getenv('MAX_ATTACHMENT_BYTES', str(10 * 1024 * 1024)))

# ── Push (VAPID) ──────────────────────────────────────────────────────────────
VAPID_PRIVATE_KEY = os.getenv('VAPID_PRIVATE_KEY', '').strip()
VAPID_PUBLIC_KEY = os.getenv('VAPID_PUBLIC_KEY', '').strip()
VAPID_CLAIMS_EMAIL = os.getenv('VAPID_CLAIMS_EMAIL', 'admin@example.com').strip()

# ── Crypto / BSC payments ─────────────────────────────────────────────────────
# Set CRYPTO_MONITOR_ENABLED=1 in production to start the BSC block watcher
CRYPTO_MONITOR_ENABLED = os.getenv('CRYPTO_MONITOR_ENABLED', '0') == '1'

# BIP-44 mnemonic for HD wallet derivation (12 or 24 words).
# REQUIRED for real deposits — keep this secret!
BSC_MASTER_MNEMONIC = os.getenv('BSC_MASTER_MNEMONIC', '').strip()

# Public BSC RPC (override with a paid node for production)
BSC_RPC_URL = os.getenv('BSC_RPC_URL', 'https://bsc-dataseed.binance.org/').strip()

# USDT BEP-20 contract on BSC mainnet
USDT_BEP20_CONTRACT = os.getenv(
    'USDT_BEP20_CONTRACT',
    '0x55d398326f99059fF775485246999027B3197955',
).strip()

# Credit wallet after this many confirmations (1 = ~3 sec on BSC)
DEPOSIT_CREDIT_CONFIRMATIONS = int(os.getenv('DEPOSIT_CREDIT_CONFIRMATIONS', '1'))
# Mark deposit as fully confirmed after this many confirmations
DEPOSIT_FULL_CONFIRMATIONS = int(os.getenv('DEPOSIT_FULL_CONFIRMATIONS', '15'))
# Maximum amount (USDT) credited on 1 confirmation without extra checks
DEPOSIT_INSTANT_LIMIT_USDT = float(os.getenv('DEPOSIT_INSTANT_LIMIT_USDT', '500'))
