#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/opt/scanpro/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="scanpro-backup-${TIMESTAMP}"
BACKUP_FOLDER="${BACKUP_DIR}/${BACKUP_NAME}"
RETENTION_DAYS=7
S3_BUCKET="scanpro-backups"
S3_ENABLED=false  # Set to true to enable S3 backups

# Create backup directory
mkdir -p "${BACKUP_FOLDER}"
echo "Created backup directory: ${BACKUP_FOLDER}"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required tools
if ! command_exists kubectl; then
  echo "Error: kubectl is not installed"
  exit 1
fi

if ! kubectl cluster-info &>/dev/null; then
  echo "Error: Cannot connect to Kubernetes cluster"
  exit 1
fi

echo "Connected to Kubernetes cluster"

# Backup Kubernetes resources
echo "Backing up Kubernetes resources..."

# Create resources directory
RESOURCES_DIR="${BACKUP_FOLDER}/resources"
mkdir -p "${RESOURCES_DIR}"

# Backup all resources in the scanpro namespace
echo "Backing up all resources in the scanpro namespace..."
kubectl get all -n scanpro -o yaml > "${RESOURCES_DIR}/all-resources.yaml"

# Backup specific resource types
for resource in configmaps secrets deployments services statefulsets ingresses pvc pv; do
  echo "Backing up ${resource}..."
  kubectl get ${resource} -n scanpro -o yaml > "${RESOURCES_DIR}/${resource}.yaml"
done

# Backup PostgreSQL database
echo "Backing up PostgreSQL database..."
DB_BACKUP_FILE="${BACKUP_FOLDER}/scanprodb.sql"

# Get the postgres pod name
POSTGRES_POD=$(kubectl get pods -n scanpro -l app=postgres -o jsonpath='{.items[0].metadata.name}')

if [ -z "${POSTGRES_POD}" ]; then
  echo "Warning: PostgreSQL pod not found"
else
  echo "Found PostgreSQL pod: ${POSTGRES_POD}"
  
  # Run pg_dump inside the postgres pod
  kubectl exec -n scanpro ${POSTGRES_POD} -- \
    pg_dump -U scanprouser -d scanprodb -c --if-exists > "${DB_BACKUP_FILE}"
  
  echo "PostgreSQL database backed up to ${DB_BACKUP_FILE}"
fi

# Backup file storage
echo "Backing up file storage..."
FILE_STORAGE_DIR="${BACKUP_FOLDER}/file-storage"
mkdir -p "${FILE_STORAGE_DIR}"

# Function to backup a directory from a pod
backup_directory() {
  local pod=$1
  local source_path=$2
  local target_path=$3
  
  echo "Backing up ${source_path} from ${pod}..."
  
  # Create target directory
  mkdir -p "${target_path}"
  
  # Get list of files
  file_list=$(kubectl exec -n scanpro ${pod} -- find ${source_path} -type f -not -path "*/\.*" | grep -v node_modules)
  
  # Process each file
  for file in ${file_list}; do
    # Create directory structure
    rel_path=${file#${source_path}}
    dir_path=$(dirname "${target_path}${rel_path}")
    mkdir -p "${dir_path}"
    
    # Copy file from pod
    kubectl cp scanpro/${pod}:${file} "${target_path}${rel_path}"
  done
}

# Get the scanpro pod name
SCANPRO_POD=$(kubectl get pods -n scanpro -l app=scanpro -o jsonpath='{.items[0].metadata.name}')

if [ -z "${SCANPRO_POD}" ]; then
  echo "Warning: ScanPro pod not found"
else
  echo "Found ScanPro pod: ${SCANPRO_POD}"
  
  # Backup important directories
  backup_directory ${SCANPRO_POD} "/app/uploads" "${FILE_STORAGE_DIR}/uploads"
  backup_directory ${SCANPRO_POD} "/app/public/conversions" "${FILE_STORAGE_DIR}/conversions"
  backup_directory ${SCANPRO_POD} "/app/public/compressions" "${FILE_STORAGE_DIR}/compressions"
fi

# Create a compressed archive of the backup
echo "Creating compressed backup archive..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
echo "Compressed backup created: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# Upload to S3 if enabled
if [ "${S3_ENABLED}" = true ]; then
  if command_exists aws; then
    echo "Uploading backup to S3..."
    aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" "s3://${S3_BUCKET}/"
    echo "Backup uploaded to s3://${S3_BUCKET}/${BACKUP_NAME}.tar.gz"
  else
    echo "Warning: aws CLI not found, skipping S3 upload"
  fi
fi

# Clean up old backups
echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "scanpro-backup-*" -type d -mtime +${RETENTION_DAYS} -exec rm -rf {} \;
find "${BACKUP_DIR}" -name "scanpro-backup-*.tar.gz" -type f -mtime +${RETENTION_DAYS} -exec rm -f {} \;

# Clean up the uncompressed backup folder
rm -rf "${BACKUP_FOLDER}"

echo "Backup completed successfully!"
echo "Backup stored at: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"