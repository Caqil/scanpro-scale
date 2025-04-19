#!/bin/bash
set -e

# Check if backup file parameter is provided
if [ -z "$1" ]; then
  echo "Error: No backup file specified"
  echo "Usage: $0 <path-to-backup-file>"
  exit 1
fi

BACKUP_FILE="$1"

# Verify the backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

# Get the PostgreSQL pod name
POSTGRES_POD=$(kubectl get pods -n scanpro -l app=postgres -o jsonpath='{.items[0].metadata.name}')

# Confirm restore action
echo "WARNING: This will overwrite the current database. All existing data will be lost."
read -p "Are you sure you want to continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restore cancelled."
  exit 1
fi

# Copy the backup file to the pod
echo "Copying backup file to PostgreSQL pod..."
kubectl cp "${BACKUP_FILE}" scanpro/${POSTGRES_POD}:/tmp/database-backup.sql

# Restore the database
echo "Restoring database from backup..."
kubectl exec -n scanpro ${POSTGRES_POD} -- bash -c "psql -U scanprouser -d scanprodb -f /tmp/database-backup.sql"

# Clean up
kubectl exec -n scanpro ${POSTGRES_POD} -- rm /tmp/database-backup.sql

echo "Database restore completed successfully!"