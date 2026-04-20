"""Безпека: хешування, токени, шифрування повідомлень."""
from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

try:
    import bcrypt
    _USE_BCRYPT = True
except ImportError:
    import hashlib
    _USE_BCRYPT = False

from ..config import SECRET_KEY, TOKEN_TTL_HOURS, MESSENGER_ENCRYPTION_KEYS

_REFRESH_THRESHOLD_HOURS = 24 * 7

# ── Password ─────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    if _USE_BCRYPT:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()
    import hashlib
    return hashlib.sha256(f"{SECRET_KEY}:{password}".encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    if hashed.startswith(('$2b$', '$2a$', '$2y$')):
        if not _USE_BCRYPT:
            return False
        try:
            return bcrypt.checkpw(password.encode(), hashed.encode())
        except Exception:
            return False
    import hashlib, hmac as _hmac
    expected = hashlib.sha256(f"{SECRET_KEY}:{password}".encode()).hexdigest()
    return _hmac.compare_digest(expected, hashed)


# ── Tokens ────────────────────────────────────────────────────────────────────

def generate_token() -> str:
    return secrets.token_urlsafe(32)


def token_expiration_iso() -> str:
    return (datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS)).isoformat()


def should_refresh_session(expires_at_raw) -> bool:
    try:
        if isinstance(expires_at_raw, datetime):
            exp = expires_at_raw
        else:
            exp = datetime.fromisoformat(str(expires_at_raw))
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        return (exp - datetime.now(timezone.utc)).total_seconds() < _REFRESH_THRESHOLD_HOURS * 3600
    except Exception:
        return False


# ── Message encryption (Fernet) ───────────────────────────────────────────────

def _build_fernet_keys():
    if not MESSENGER_ENCRYPTION_KEYS:
        return None
    try:
        from cryptography.fernet import MultiFernet, Fernet
        keys = [k.strip() for k in MESSENGER_ENCRYPTION_KEYS.split(',') if k.strip()]
        return MultiFernet([Fernet(k.encode()) for k in keys])
    except Exception:
        return None


_fernet = _build_fernet_keys()


def encrypt_message(plaintext: str) -> str:
    if _fernet is None:
        return plaintext
    return _fernet.encrypt(plaintext.encode()).decode()


def decrypt_message(ciphertext: str) -> str:
    if _fernet is None:
        return ciphertext
    try:
        return _fernet.decrypt(ciphertext.encode()).decode()
    except Exception:
        return ciphertext
