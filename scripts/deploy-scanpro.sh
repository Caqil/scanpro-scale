#!/bin/bash

# Define namespace
NAMESPACE=${1:-scanpro}
echo "Using namespace: $NAMESPACE"

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

echo "Deploying ScanPro to Kubernetes (without database components)..."

# Create namespace if it doesn't exist
if ! kubectl get namespace ${NAMESPACE} &>/dev/null; then
  echo "Namespace ${NAMESPACE} does not exist. Creating..."
  kubectl create namespace ${NAMESPACE}
fi

# Create storage resources
echo "Setting up storage resources..."
kubectl apply -f manifests/storage/storage-class.yaml
kubectl apply -f manifests/storage/persistent-volumes.yaml

# Apply application configuration
echo "Creating application configuration..."
kubectl apply -f manifests/backend/scanpro-configmap.yaml
kubectl apply -f manifests/backend/scanpro-secret.yaml

# Deploy ScanPro
echo "Deploying ScanPro application..."
kubectl apply -f manifests/backend/scanpro-deployment.yaml
kubectl apply -f manifests/backend/scanpro-service.yaml

# Wait for ScanPro to be ready
echo "Waiting for ScanPro to be ready..."
kubectl -n ${NAMESPACE} wait --for=condition=available --timeout=300s deployment/scanpro || {
  echo "WARNING: ScanPro deployment timed out after 5 minutes."
  echo "Check status with: kubectl -n ${NAMESPACE} get pods | grep scanpro"
}

# Deploy ingress
echo "Deploying ingress..."
kubectl apply -f manifests/ingress/scanpro-ingress.yaml

echo "ScanPro deployment completed successfully!"

# Get the ingress IP or hostname
INGRESS_IP=$(kubectl -n ${NAMESPACE} get ingress scanpro-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
INGRESS_HOSTNAME=$(kubectl -n ${NAMESPACE} get ingress scanpro-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)

echo "Access ScanPro at: https://scanpro.cc"
[ -n "$INGRESS_IP" ] && echo "Load Balancer IP: $INGRESS_IP"
[ -n "$INGRESS_HOSTNAME" ] && echo "Load Balancer Hostname: $INGRESS_HOSTNAME"

# Status summary
echo ""
echo "Deployment Status Summary:"
kubectl get pods -n ${NAMESPACE}
echo ""
echo "Service Status:"
kubectl get services -n ${NAMESPACE}
echo ""
echo "Ingress Status:"
kubectl get ingress -n ${NAMESPACE}