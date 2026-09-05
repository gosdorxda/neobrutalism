#!/usr/bin/env bash
# CatBowl auto-deploy script
# Run: ./deploy.sh
# Does: git fetch → if behind: pull + install (if deps changed) + build + pm2 restart
# Safe to run repeatedly or via cron. Exits early if already up to date.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
cd "$SCRIPT_DIR"

APP_NAME="neobrutalism"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "==> [$(date '+%Y-%m-%d %H:%M:%S')] Checking for updates on origin/$BRANCH..."
git fetch --all

BEHIND="$(git rev-list --count "HEAD..origin/$BRANCH" 2>/dev/null || echo 0)"

if [ "$BEHIND" = "0" ]; then
  echo "==> Already up to date. Nothing to deploy."
  exit 0
fi

echo "==> $BEHIND new commit(s) found. Deploying..."

LOCK_BEFORE="$(sha1sum package-lock.json 2>/dev/null | cut -d' ' -f1)"

echo "==> git pull..."
git pull --ff-only

LOCK_AFTER="$(sha1sum package-lock.json 2>/dev/null | cut -d' ' -f1)"

if [ "$LOCK_BEFORE" != "$LOCK_AFTER" ]; then
  echo "==> package-lock.json changed. Running npm install..."
  npm install
elif [ ! -d "node_modules" ]; then
  echo "==> node_modules missing. Running npm install..."
  npm install
else
  echo "==> No dependency changes. Skipping npm install."
fi

echo "==> Building (npm run build)..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build

echo "==> Restarting PM2 app: $APP_NAME..."
pm2 restart "$APP_NAME" --update-env

echo "==> [$(date '+%Y-%m-%d %H:%M:%S')] Deploy complete."
pm2 jlist | grep -o "\"name\":\"$APP_NAME\"" >/dev/null 2>&1 && echo "==> $APP_NAME is running." || echo "==> WARNING: $APP_NAME not found in PM2."
