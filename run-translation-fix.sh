#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="/Users/kissbye/Documents/cybersec-daily"
PATCH_FILE="/Users/kissbye/Documents/Playground/cybersec-daily/translation-fix-full.patch"

if [[ ! -d "$TARGET_DIR/.git" ]]; then
  echo "[error] target repo not found: $TARGET_DIR" >&2
  exit 1
fi

if [[ ! -f "$PATCH_FILE" ]]; then
  echo "[error] patch not found: $PATCH_FILE" >&2
  exit 1
fi

echo "[step] applying patch..."
git -C "$TARGET_DIR" apply "$PATCH_FILE"

echo "[step] verifying changed files..."
git -C "$TARGET_DIR" status --short

echo "[step] running tests..."
npm --prefix "$TARGET_DIR" test

missing=0
for v in KV_REST_API_URL KV_REST_API_TOKEN CRON_SECRET APP_BASE_URL; do
  if [[ -z "${!v:-}" ]]; then
    echo "[warn] missing env: $v"
    missing=1
  fi
done

if [[ "$missing" -eq 1 ]]; then
  cat <<'MSG'
[stop] env vars are required before full translation repair.
Export vars and rerun only this step:
  npm --prefix /Users/kissbye/Documents/cybersec-daily run repair:translations:all
MSG
  exit 2
fi

echo "[step] running full translation repair..."
npm --prefix "$TARGET_DIR" run repair:translations:all

echo "[done] translation fix applied and repair job executed."
