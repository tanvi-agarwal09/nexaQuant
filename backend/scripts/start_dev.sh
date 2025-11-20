#!/usr/bin/env bash
# backend/scripts/start_dev.sh
set -e

cd "$(dirname "$0")/.."
echo "Starting backend (uvicorn src.app.main:app --reload --port 8000)"
uvicorn src.app.main:app --reload --port 8000
