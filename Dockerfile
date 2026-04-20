FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY index.html tsconfig.json vite.config.ts ./
COPY src/ ./src/
RUN npm run build

FROM python:3.12-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc g++ libssl-dev libffi-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
 && pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY database/ ./database/
COPY start.py .
COPY --from=frontend-builder /app/dist ./dist

ENV PORT=8000
EXPOSE $PORT

CMD gunicorn backend.app:app \
    --worker-class eventlet -w 1 \
    --bind 0.0.0.0:$PORT --timeout 120 --log-level info
