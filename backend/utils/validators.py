"""Валідатори вхідних даних."""
from __future__ import annotations

import re


def require_fields(data: dict, fields: list[str]) -> None:
    missing = [f for f in fields if not (data or {}).get(f, '')]
    if missing:
        raise ValueError(f"Відсутні поля: {', '.join(missing)}.")


def validate_phone(phone: str) -> None:
    clean = re.sub(r'\s', '', phone)
    if not re.match(r'^\+?\d{10,15}$', clean):
        raise ValueError('Невірний формат телефону.')


def validate_email(email: str) -> None:
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        raise ValueError('Невірний формат email.')


def validate_password(password: str) -> None:
    if len(password) < 8:
        raise ValueError('Пароль має бути не менше 8 символів.')


def validate_message_body(body: str) -> None:
    if not body or not body.strip():
        raise ValueError('Повідомлення не може бути порожнім.')
    if len(body) > 10000:
        raise ValueError('Повідомлення занадто довге (максимум 10 000 символів).')


def validate_chat_title(title: str) -> None:
    if not title or not title.strip():
        raise ValueError('Назва чату не може бути порожньою.')
    if len(title.strip()) > 128:
        raise ValueError('Назва чату занадто довга (максимум 128 символів).')
