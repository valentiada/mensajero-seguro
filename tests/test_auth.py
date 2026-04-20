"""Тести автентифікації."""
import pytest
from backend.app import app as flask_app


@pytest.fixture()
def app():
    flask_app.config.update(TESTING=True)
    yield flask_app


@pytest.fixture()
def client(app):
    return app.test_client()


def test_ping(client):
    r = client.get('/api/ping')
    assert r.status_code == 200
    assert r.json['ok'] is True


def test_register_and_login(client):
    payload = {
        'full_name': 'Тест Тестенко',
        'phone': '+380991234567',
        'email': 'test@example.com',
        'password': 'SecurePass1',
    }
    r = client.post('/api/auth/register', json=payload)
    assert r.status_code == 200
    assert r.json['ok'] is True
    assert 'token' in r.json['data']

    r2 = client.post('/api/auth/login', json={
        'identity': '+380991234567',
        'password': 'SecurePass1',
    })
    assert r2.status_code == 200
    assert r2.json['ok'] is True
    token = r2.json['data']['token']

    r3 = client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert r3.status_code == 200
    assert r3.json['data']['phone'] == '+380991234567'


def test_login_wrong_password(client):
    r = client.post('/api/auth/login', json={
        'identity': 'nobody@example.com',
        'password': 'wrong',
    })
    assert r.status_code == 401
    assert r.json['ok'] is False


def test_me_without_token(client):
    r = client.get('/api/auth/me')
    assert r.status_code == 401
