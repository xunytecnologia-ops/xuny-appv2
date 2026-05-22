#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-xuny-appv2-api}"
API_PORT="${API_PORT:-5000}"
NODE_ENV="${NODE_ENV:-production}"

cd "$REPO_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "git não encontrado"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node não encontrado"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm não encontrado"
  exit 1
fi

if [ ! -d ".git" ]; then
  echo "Este diretório não é um repositório git"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "remote origin não configurado"
  exit 1
fi

git fetch --prune origin
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

if [ ! -f "server/.env" ]; then
  echo "server/.env não existe. Crie a partir de server/.env.example e preencha as variáveis"
  exit 1
fi

npm ci
npm run build
(cd server && npm ci)

if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 não encontrado. Instale com: npm i -g pm2"
  exit 1
fi

if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  NODE_ENV="$NODE_ENV" PORT="$API_PORT" pm2 restart "$PM2_NAME" --update-env
else
  NODE_ENV="$NODE_ENV" PORT="$API_PORT" pm2 start server/index.js --name "$PM2_NAME" --time
fi

pm2 save
pm2 status "$PM2_NAME"
