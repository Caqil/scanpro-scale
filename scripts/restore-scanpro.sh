#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/opt/scanpro/backups"
S3_BUCKET="scanpro-backups"
S3_ENABLED=false  # Set to true to restore from S3

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

# Check if backup argument is provided
if [ -z "$1" ]; then
  echo "Error: No backup specified"
  echo "Usage: $0 <backup-file-or-name> [namespace]"
  echo "Examples:"
  echo "  $0 scanpro-backup-20250415-120000.tar.gz"
  echo "  $0 scanpro-backup-20250415-120000"
  echo "  $0 s3://scanpro-backups/scanpro-backup-20250415-120000.tar.gz"
  exit 1
fi

# Set namespace
NAMESPACE=${2:-scanpro}
echo "Using namespace: $NAMESPACE"

# Check if namespace exists
if ! kubectl get namespace ${NAMESPACE} &>/dev/null; then
  echo "Namespace ${NAMESPACE} does not exist. Creating..."
  kubectl create namespace ${NAMESPACE}
fi

# Process backup location
BACKUP_PATH="$1"

# Handle S3 backup
if [[ "${BACKUP_PATH}" == s3://* ]]; then
  if [ "${S3_ENABLED}" != true ]; then
    echo "Error: S3 is not enabled in configuration"
    exit 1
  fi
  
  if ! command_exists aws; then
    echo "Error: aws CLI not found"
    exit 1
  fi
  
  echo "Downloading backup from S3..."
  S3_PATH="${BACKUP_PATH#s3://}"
  BUCKET=$(echo ${S3_PATH} | cut -d'/' -f1)
  KEY=$(echo ${S3_PATH} | cut -d'/' -f2-)
  
  BACKUP_FILENAME=$(basename ${KEY})
  aws s3 cp "${BACKUP_PATH}" "${BACKUP_DIR}/${BACKUP_FILENAME}"
  BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
  echo "Downloaded backup to ${BACKUP_PATH}"
fi

# Extract backup name
if [[ "${BACKUP_PATH}" == *.tar.gz ]]; then
  BACKUP_NAME=$(basename ${BACKUP_PATH} .tar.gz)
  
  # Check if backup file exists
  if [ ! -f "${BACKUP_PATH}" ]; then
    echo "Error: Backup file not found: ${BACKUP_PATH}"
    exit 1
  fi
  
  # Extract backup
  echo "Extracting backup: ${BACKUP_PATH}"
  cd "${BACKUP_DIR}"
  tar -xzf "${BACKUP_PATH}"
  
  EXTRACTED_DIR="${BACKUP_DIR}/${BACKUP_NAME}"
else
  BACKUP_NAME="$1"
  EXTRACTED_DIR="${BACKUP_DIR}/${BACKUP_NAME}"
  
  # Check if backup directory exists
  if [ ! -d "${EXTRACTED_DIR}" ]; then
    echo "Error: Backup directory not found: ${EXTRACTED_DIR}"
    exit 1
  fi
fi

echo "Using backup: ${BACKUP_NAME}"
echo "Backup directory: ${EXTRACTED_DIR}"

# Confirm restoration
echo "Warning: This will restore ScanPro data and potentially overwrite existing data."
read -p "Are you sure you want to continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restoration cancelled."
  exit 1
fi

# Restore Kubernetes resources
echo "Restoring Kubernetes resources..."
RESOURCES_DIR="${EXTRACTED_DIR}/resources"

if [ ! -d "${RESOURCES_DIR}" ]; then
  echo "Error: Resources directory not found in backup"
  exit 1
fi

# Apply ConfigMaps and Secrets first
if [ -f "${RESOURCES_DIR}/configmaps.yaml" ]; then
  echo "Restoring ConfigMaps..."
  kubectl apply -f "${RESOURCES_DIR}/configmaps.yaml"
fi

if [ -f "${RESOURCES_DIR}/secrets.yaml" ]; then
  echo "Restoring Secrets..."
  kubectl apply -f "${RESOURCES_DIR}/secrets.yaml"
fi

# Restore PVs and PVCs
if [ -f "${RESOURCES_DIR}/pv.yaml" ]; then
  echo "Restoring PersistentVolumes..."
  kubectl apply -f "${RESOURCES_DIR}/pv.yaml"
fi

if [ -f "${RESOURCES_DIR}/pvc.yaml" ]; then
  echo "Restoring PersistentVolumeClaims..."
  kubectl apply -f "${RESOURCES_DIR}/pvc.yaml"
fi

# Wait for PVCs to be bound
echo "Waiting for PersistentVolumeClaims to be bound..."
kubectl wait --for=condition=bound pvc --all -n ${NAMESPACE} --timeout=60s || true

# Restore database
DB_BACKUP_FILE="${EXTRACTED_DIR}/scanprodb.sql"
if [ -f "${DB_BACKUP_FILE}" ]; then
  echo "Restoring PostgreSQL database..."
  
  # Deploy postgres if not exists
  if ! kubectl get deployment -n ${NAMESPACE} | grep -q postgres; then
    echo "PostgreSQL deployment not found. Deploying..."
    
    # Check if we have a PostgreSQL manifest
    if [ -f "${RESOURCES_DIR}/deployments.yaml" ]; then
      grep -A 1000 "kind: Deployment" "${RESOURCES_DIR}/deployments.yaml" | grep -A 1000 -B 1 "name: postgres" | kubectl apply -f -
    else
      echo "Warning: PostgreSQL deployment manifest not found in backup"
      echo "You may need to deploy PostgreSQL manually"
    fi
    
    if [ -f "${RESOURCES_DIR}/services.yaml" ]; then
      grep -A 1000 "kind: Service" "${RESOURCES_DIR}/services.yaml" | grep -A 1000 -B 1 "name: postgres" | kubectl apply -f -
    fi
    
    echo "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=available deployment/postgres -n ${NAMESPACE} --timeout=300s
  fi
  
  # Get the postgres pod name
  POSTGRES_POD=$(kubectl get pods -n ${NAMESPACE} -l app=postgres -o jsonpath='{.items[0].metadata.name}')
  
  if [ -z "${POSTGRES_POD}" ]; then
    echo "Error: PostgreSQL pod not found"
  else
    echo "Found PostgreSQL pod: ${POSTGRES_POD}"
    
    # Copy the SQL file to the pod
    echo "Copying database backup to pod..."
    kubectl cp "${DB_BACKUP_FILE}" ${NAMESPACE}/${POSTGRES_POD}:/tmp/scanprodb.sql
    
    # Restore the database
    echo "Restoring database..."
    kubectl exec -n ${NAMESPACE} ${POSTGRES_POD} -- \
      psql -U scanprouser -d scanprodb -f /tmp/scanprodb.sql
    
    echo "PostgreSQL database restored"
    
    # Clean up
    kubectl exec -n ${NAMESPACE} ${POSTGRES_POD} -- rm /tmp/scanprodb.sql
  fi
else
  echo "Warning: Database backup file not found"
fi

# Restore file storage
FILE_STORAGE_DIR="${EXTRACTED_DIR}/file-storage"
if [ -d "${FILE_STORAGE_DIR}" ]; then
  echo "Restoring file storage..."
  
  # Deploy ScanPro if not exists
  if ! kubectl get deployment -n ${NAMESPACE} | grep -q scanpro; then
    echo "ScanPro deployment not found. Deploying..."
    
    if [ -f "${RESOURCES_DIR}/deployments.yaml" ]; then
      grep -A 1000 "kind: Deployment" "${RESOURCES_DIR}/deployments.yaml" | grep -A 1000 -B 1 "name: scanpro" | kubectl apply -f -
    else
      echo "Warning: ScanPro deployment manifest not found in backup"
      echo "You may need to deploy ScanPro manually"
    fi
    
    if [ -f "${RESOURCES_DIR}/services.yaml" ]; then
      grep -A 1000 "kind: Service" "${RESOURCES_DIR}/services.yaml" | grep -A 1000 -B 1 "name: scanpro" | kubectl apply -f -
    fi
    
    echo "Waiting for ScanPro to be ready..."
    kubectl wait --for=condition=available deployment/scanpro -n ${NAMESPACE} --timeout=300s
  fi
  
  # Get the scanpro pod name
  SCANPRO_POD=$(kubectl get pods -n ${NAMESPACE} -l app=scanpro -o jsonpath='{.items[0].metadata.name}')
  
  if [ -z "${SCANPRO_POD}" ]; then
    echo "Error: ScanPro pod not found"
  else
    echo "Found ScanPro pod: ${SCANPRO_POD}"
    
    # Restore directories
    if [ -d "${FILE_STORAGE_DIR}/uploads" ]; then
      echo "Restoring uploads directory..."
      kubectl exec -n ${NAMESPACE} ${SCANPRO_POD} -- mkdir -p /app/uploads
      find "${FILE_STORAGE_DIR}/uploads" -type f | while read file; do
        rel_path="${file#${FILE_STORAGE_DIR}/uploads/}"
        kubectl cp "${file}" ${NAMESPACE}/${SCANPRO_POD}:/app/uploads/${rel_path}
      done
    fi
    
    if [ -d "${FILE_STORAGE_DIR}/conversions" ]; then
      echo "Restoring conversions directory..."
      kubectl exec -n ${NAMESPACE} ${SCANPRO_POD} -- mkdir -p /app/public/conversions
      find "${FILE_STORAGE_DIR}/conversions" -type f | while read file; do
        rel_path="${file#${FILE_STORAGE_DIR}/conversions/}"
        kubectl cp "${file}" ${NAMESPACE}/${SCANPRO_POD}:/app/public/conversions/${rel_path}
      done
    fi
    
    if [ -d "${FILE_STORAGE_DIR}/compressions" ]; then
      echo "Restoring compressions directory..."
      kubectl exec -n ${NAMESPACE} ${SCANPRO_POD} -- mkdir -p /app/public/compressions
      find "${FILE_STORAGE_DIR}/compressions" -type f | while read file; do
        rel_path="${file#${FILE_STORAGE_DIR}/compressions/}"
        kubectl cp "${file}" ${NAMESPACE}/${SCANPRO_POD}:/app/public/compressions/${rel_path}
      done
    fi
    
    echo "File storage restored"
  fi
else
  echo "Warning: File storage directory not found in backup"
fi

# Restore remaining resources
echo "Restoring remaining Kubernetes resources..."

# Deployments
if [ -f "${RESOURCES_DIR}/deployments.yaml" ]; then
  echo "Restoring Deployments..."
  kubectl apply -f "${RESOURCES_DIR}/deployments.yaml"
fi

# Services
if [ -f "${RESOURCES_DIR}/services.yaml" ]; then
  echo "Restoring Services..."
  kubectl apply -f "${RESOURCES_DIR}/services.yaml"
fi

# Ingresses
if [ -f "${RESOURCES_DIR}/ingresses.yaml" ]; then
  echo "Restoring Ingresses..."
  kubectl apply -f "${RESOURCES_DIR}/ingresses.yaml"
fi

echo "Restoration completed successfully!"
echo "Note: You may need to restart some pods for the changes to take effect."
echo "You can do this with: kubectl rollout restart deployment -n ${NAMESPACE}"