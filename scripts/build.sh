#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
bash "$COZE_WORKSPACE_PATH/scripts/prepare-node-modules.sh" --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

echo "Building frontend with Vite..."
pnpm vite build

echo "Bundling server with tsup..."
# NOTE: `server/vite.ts` no longer imports `vite.config.ts` at module scope, but Vite (and
# its config file) still drag the @vitejs/plugin-react -> @babel/core chain in at runtime for
# the dev middleware path. Keep them external or tsup's CJS bundler fails on
# "Could not resolve @babel/preset-typescript/package.json".
pnpm tsup server/server.ts --format cjs --platform node --target node20 --outDir dist-server \
  --no-splitting --no-minify \
  --external vite --external @vitejs/plugin-react --external @babel/core

echo "Build completed successfully!"
