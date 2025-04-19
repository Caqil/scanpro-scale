#!/bin/bash
set -e

# Find the PostgreSQL pod
POSTGRES_POD=$(kubectl get pods -n scanpro -l app=postgres -o jsonpath='{.items[0].metadata.name}')

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL pod to be ready..."
kubectl wait --for=condition=ready pod/$POSTGRES_POD -n scanpro --timeout=120s

# Find a ScanPro pod to run migrations from
SCANPRO_POD=$(kubectl get pods -n scanpro -l app=scanpro -o jsonpath='{.items[0].metadata.name}')

# Run database migrations using Prisma
echo "Running database migrations..."
kubectl exec -n scanpro $SCANPRO_POD -- npx prisma migrate deploy

echo "Database initialization complete!"