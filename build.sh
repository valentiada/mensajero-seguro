#!/usr/bin/env bash
set -e

echo "==> Installing Node deps..."
npm ci

echo "==> Building frontend..."
npm run build

echo "==> Python deps already installed by Render"
