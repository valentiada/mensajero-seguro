"""Сервіс автентифікації."""
from __future__ import annotations

from datetime import datetime, timezone

from ..repositories.user_repository import UserRepository
from ..utils.security import (
    generate_token, hash_password, should_refresh_session,
    token_expiration_iso, verify_password,
)
from ..utils.validators import (
    require_fields, validate_email, validate_password, validate_phone,
)


class AuthService:
    def __init__(self) -> None:
        self.users = UserRepository()

    def register(self, data: dict) -> dict:
        require_fields(data, ['full_name', 'phone', 'email', 'password'])
        validate_phone(data['phone'])
        validate_email(data['email'])
        validate_password(data['password'])

        phone = data['phone'].strip()
        email = data['email'].strip().lower()

        if self.users.get_by_phone_or_email(phone):
            raise ValueError('Користувач з таким телефоном або email вже існує.')

        user_id = self.users.create_user(
            full_name=data['full_name'].strip(),
            phone=phone,
            email=email,
            password_hash=hash_password(data['password']),
        )
        return self.login({'identity': email, 'password': data['password']})

    def login(self, data: dict) -> dict:
        require_fields(data, ['identity', 'password'])
        identity = data['identity'].strip()
        user = self.users.get_by_phone_or_email(identity)
        if not user or not verify_password(data['password'], user['password_hash']):
            raise ValueError('Невірні облікові дані.')

        self.users.delete_expired_sessions(user['id'])
        self.users.set_online(user['id'], True)

        token = generate_token()
        self.users.create_session(user['id'], token, token_expiration_iso())

        return {
            'token': token,
            'user': {
                'id': user['id'],
                'full_name': user['full_name'],
                'phone': user['phone'],
                'email': user['email'],
                'role': user['role'],
            },
        }

    def get_user_by_token(self, token: str) -> dict | None:
        user = self.users.get_user_by_token(token)
        if not user:
            return None
        expires_raw = user.get('expires_at', '')
        try:
            exp = expires_raw if isinstance(expires_raw, datetime) else datetime.fromisoformat(str(expires_raw))
            if exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
        except (ValueError, TypeError):
            self.users.delete_session(token)
            return None
        if exp < datetime.now(timezone.utc):
            self.users.delete_session(token)
            return None
        return user

    def refresh_session(self, token: str) -> str | None:
        try:
            ok = self.users.update_session_expiry(token, token_expiration_iso())
            return token if ok else None
        except Exception:
            return None

    def logout(self, token: str, user_id: int) -> None:
        self.users.delete_session(token)
        self.users.set_online(user_id, False)

    def list_sessions(self, user_id: int, current_token: str) -> list:
        sessions = self.users.list_sessions(user_id)
        result = []
        for s in sessions:
            d = dict(s)
            d['is_current'] = d.get('token') == current_token
            d.pop('token', None)
            result.append(d)
        return result

    def revoke_session(self, session_id: int, user_id: int) -> None:
        ok = self.users.delete_session_by_id(session_id, user_id)
        if not ok:
            raise ValueError('Сесію не знайдено.')

    def change_password(self, user_id: int, old_password: str, new_password: str) -> None:
        validate_password(new_password)
        user = self.users.get_by_id(user_id)
        if not user or not verify_password(old_password, user['password_hash']):
            raise ValueError('Поточний пароль невірний.')
        self.users.update_password(user_id, hash_password(new_password))
