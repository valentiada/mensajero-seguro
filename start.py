"""Точка входу для запуску WeeGo Messenger."""
from backend.app import app
from backend.config import DEBUG

if __name__ == '__main__':
    app.run(debug=DEBUG, port=5051)
