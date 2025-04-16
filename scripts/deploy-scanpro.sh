#!/bin/bash
set -e

# This script deploys the ScanPro application on Kubernetes

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed"
    exit 1
fi

# Check if the kubernetes cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: Kubernetes cluster is not accessible"
    exit 1
fi

# Define namespace
NAMESPACE=${1:-scanpro}
echo "Using namespace: $NAMESPACE"

# Check if namespace exists
if ! kubectl get namespace ${NAMESPACE} &>/dev/null; then
  echo "Namespace ${NAMESPACE} does not exist. Creating..."
  kubectl create namespace ${NAMESPACE}
fi

echo "Deploying ScanPro to Kubernetes..."

# Create storage resources
echo "Setting up storage resources..."
kubectl apply -f manifests/storage/storage-class.yaml
kubectl apply -f manifests/storage/persistent-volumes.yaml

# Apply database secrets
echo "Creating database secrets..."
kubectl apply -f manifests/database/db-secret.yaml

# Deploy databases
echo "Deploying databases..."
kubectl apply -f manifests/database/postgres-deployment.yaml
kubectl apply -f manifests/database/postgres-service.yaml
kubectl apply -f manifests/database/redis-deployment.yaml
kubectl apply -f manifests/database/redis-service.yaml

# Wait for databases to be ready before continuing
echo "Waiting for databases to be ready..."
kubectl -n ${NAMESPACE} wait --for=condition=available --timeout=300s deployment/postgres
kubectl -n ${NAMESPACE} wait --for=condition=available --timeout=300s deployment/redis

# Apply application configuration
echo "Creating application configuration..."
kubectl apply -f manifests/backend/scanpro-config.yaml
kubectl apply -f manifests/backend/scanpro-secret.yaml

# Deploy ScanPro
echo "Deploying ScanPro application..."
kubectl apply -f manifests/backend/scanpro-deployment.yaml
kubectl apply -f manifests/backend/scanpro-service.yaml

# Wait for ScanPro to be ready
echo "Waiting for ScanPro to be ready..."
kubectl -n ${NAMESPACE} wait --for=condition=available --timeout=300s deployment/scanpro

# Deploy ingress
echo "Deploying ingress..."
kubectl apply -f manifests/ingress/scanpro-ingress.yaml

echo "ScanPro deployment completed successfully!"

# Get the ingress IP or hostname
INGRESS_IP=$(kubectl -n ${NAMESPACE} get ingress scanpro-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
INGRESS_HOSTNAME=$(kubectl -n ${NAMESPACE} get ingress scanpro-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Access ScanPro at: https://scanpro.cc"
echo "Load Balancer IP: $INGRESS_IP"
echo "Load Balancer Hostname: $INGRESS_HOSTNAME"