#!/bin/bash
set -e

# This script initializes the database with Prisma migrations
# It should be run as part of the deployment process

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/.."

echo "Generating Prisma client..."
npx prisma generate

echo "Waiting for PostgreSQL database to be ready..."
# Function to check if PostgreSQL is ready
check_postgres() {
  npx prisma db execute --stdin <<EOF
SELECT 1;
EOF
  return $?
}

# Wait for PostgreSQL to be ready
RETRY_COUNT=0
MAX_RETRIES=30
until check_postgres; do
  RETRY_COUNT=$((RETRY_COUNT+1))
  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Failed to connect to PostgreSQL after $MAX_RETRIES attempts. Exiting."
    exit 1
  fi
  echo "PostgreSQL not ready yet. Retrying in 5 seconds... (Attempt $RETRY_COUNT of $MAX_RETRIES)"
  sleep 5
done

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding initial data..."
npx prisma db seed