#!/bin/sh
# Applies any pending Prisma migrations against the mounted SQLite volume before the server starts.
set -e

echo "Applying database migrations..."
node node_modules/prisma/build/index.js migrate deploy

echo "Starting server..."
exec "$@"
