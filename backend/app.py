"""Flask-застосунок WeeGo Messenger."""
from __future__ import annotations

import os
import uuid
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_compress import Compress
from flask_socketio import SocketIO

from .config import BASE_PATH, DEBUG
from .database import init_db
from .routes.auth_routes import auth_bp
from .routes.call_routes import call_bp
from .routes.casino_routes import casino_bp
from .routes.chat_routes import chat_bp
from .routes.admin_routes import admin_bp
from .routes.crypto_routes import crypto_bp
from .routes.message_routes import msg_bp
from .routes.support_routes import support_bp
from .routes.user_routes import user_bp

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / 'frontend'
DIST_DIR = BASE_DIR / 'dist'

app = Flask(__name__, static_folder=None)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'weego-demo-secret')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_ATTACHMENT_BYTES', str(10 * 1024 * 1024)))

Compress(app)

socketio = SocketIO(
    app,
    cors_allowed_origins='*',
    async_mode='eventlet',
    logger=False,
    engineio_logger=False,
)

# ── DB init ───────────────────────────────────────────────────────────────────
with app.app_context():
    try:
        init_db()
        _seed_admin()
    except Exception as _e:
        app.logger.warning('DB init: %s', _e)


def _seed_admin():
    from .config import ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, ADMIN_PHONE
    if not (ADMIN_EMAIL and ADMIN_PASSWORD):
        return
    from .repositories.user_repository import UserRepository
    from .utils.security import hash_password
    users = UserRepository()
    if users.get_by_phone_or_email(ADMIN_EMAIL):
        return
    user_id = users.create_user(
        full_name=ADMIN_NAME,
        phone=ADMIN_PHONE,
        email=ADMIN_EMAIL,
        password_hash=hash_password(ADMIN_PASSWORD),
    )
    from .database import execute
    execute("UPDATE users SET role = 'admin' WHERE id = ?", (user_id,))
    app.logger.info('Admin seeded: %s', ADMIN_EMAIL)


# ── CORS ──────────────────────────────────────────────────────────────────────
_ALLOWED_ORIGINS = {
    'http://localhost:3001',
    'http://localhost:5051',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5051',
}

if os.getenv('ALLOWED_ORIGINS'):
    for o in os.getenv('ALLOWED_ORIGINS').split(','):
        _ALLOWED_ORIGINS.add(o.strip())


@app.before_request
def _cors_preflight():
    if request.method == 'OPTIONS':
        origin = request.headers.get('Origin', '')
        if origin in _ALLOWED_ORIGINS:
            from flask import make_response
            resp = make_response('', 204)
            resp.headers['Access-Control-Allow-Origin'] = origin
            resp.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
            resp.headers['Access-Control-Allow-Headers'] = 'Authorization,Content-Type,Idempotency-Key'
            resp.headers['Access-Control-Max-Age'] = '86400'
            return resp


@app.after_request
def _headers(response):
    origin = request.headers.get('Origin', '')
    if origin in _ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Expose-Headers'] = 'X-Refresh-Token,X-Request-Id'

    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'

    if request.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store'
    elif request.path.endswith(('.js', '.css', '.woff2', '.woff', '.ttf')):
        response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'

    rid = request.headers.get('X-Request-Id') or str(uuid.uuid4())[:8]
    response.headers['X-Request-Id'] = rid
    return response


# ── Blueprints ────────────────────────────────────────────────────────────────
for bp in (auth_bp, chat_bp, msg_bp, call_bp, user_bp, support_bp, casino_bp, crypto_bp, admin_bp):
    app.register_blueprint(bp)

# ── Socket.IO namespaces ──────────────────────────────────────────────────────
from .routes.crash_ws import CrashNamespace  # noqa: E402
from .services.crash_ws_service import start_loop as _start_crash_loop  # noqa: E402

socketio.on_namespace(CrashNamespace('/crash'))
_start_crash_loop(socketio)

# Start BSC deposit monitor (only when enabled via env var)
from .config import CRYPTO_MONITOR_ENABLED  # noqa: E402
if CRYPTO_MONITOR_ENABLED:
    from .services.crypto_service import CryptoService as _CS
    _CS().start_monitor()


# ── Ping / keep-alive ─────────────────────────────────────────────────────────
@app.get('/api/ping')
def ping():
    return jsonify({'ok': True, 'service': 'weego-messenger'})


# ── SPA static serving ────────────────────────────────────────────────────────
def _serve_spa(directory: Path):
    @app.route('/messenger/', defaults={'path': ''})
    @app.route('/messenger/<path:path>')
    def spa(path):
        if path and (directory / path).exists():
            return send_from_directory(str(directory), path)
        return send_from_directory(str(directory), 'index.html')


if DIST_DIR.exists():
    _serve_spa(DIST_DIR)
elif FRONTEND_DIR.exists():
    _serve_spa(FRONTEND_DIR)


# ── Error handlers ────────────────────────────────────────────────────────────
@app.errorhandler(400)
def bad_request(e):
    return jsonify({'ok': False, 'error': 'Невірний запит.'}), 400


@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({'ok': False, 'error': 'Не знайдено.'}), 404
    if DIST_DIR.exists():
        return send_from_directory(str(DIST_DIR), 'index.html')
    return jsonify({'ok': False, 'error': 'Не знайдено.'}), 404


@app.errorhandler(413)
def too_large(e):
    return jsonify({'ok': False, 'error': 'Файл завеликий.'}), 413


@app.errorhandler(500)
def server_error(e):
    app.logger.exception('Internal error')
    return jsonify({'ok': False, 'error': 'Внутрішня помилка сервера.'}), 500
