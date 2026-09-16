#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"

# This entry point always runs the compiled server from dist-server/, so default the
# runtime to PROD. Without it server/vite.ts falls back to the dev path and boots a
# Vite middleware server instead of serving dist/ (the platform usually sets this).
export COZE_PROJECT_ENV="${COZE_PROJECT_ENV:-PROD}"


start_service() {
    cd "${COZE_WORKSPACE_PATH}"
    echo "Starting express production server on port ${DEPLOY_RUN_PORT}..."
    PORT=$DEPLOY_RUN_PORT node dist-server/server.js
}

echo "Starting express production server on port ${DEPLOY_RUN_PORT}..."
start_service
