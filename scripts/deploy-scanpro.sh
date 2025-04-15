#!/bin/bash
set -e

# This script deploys the entire ScanPro application on Kubernetes with KubeSphere

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

# Check if the directory structure exists
ROOT_DIR=$(dirname "$(dirname "$(readlink -f "$0")")")
MANIFESTS_DIR="$ROOT_DIR/manifests"

if [ ! -d "$MANIFESTS_DIR" ]; then
    echo "Error: Manifests directory not found at $MANIFESTS_DIR"
    exit 1
fi

echo "Deploying ScanPro to Kubernetes with KubeSphere..."

# Create namespace
echo "Creating namespace..."
kubectl apply -f "$MANIFESTS_DIR/namespace.yaml"

# Create storage resources
echo "Setting up storage resources..."
kubectl apply -f "$MANIFESTS_DIR/storage/storage-class.yaml"
kubectl apply -f "$MANIFESTS_DIR/storage/persistent-volumes.yaml"

# Apply database secrets
echo "Creating database secrets..."
kubectl apply -f "$MANIFESTS_DIR/database/db-secret.yaml"

# Deploy databases
echo "Deploying databases..."
kubectl apply -f "$MANIFESTS_DIR/database/postgres-deployment.yaml"
kubectl apply -f "$MANIFESTS_DIR/database/postgres-service.yaml"
kubectl apply -f "$MANIFESTS_DIR/database/redis-deployment.yaml"
kubectl apply -f "$MANIFESTS_DIR/database/redis-service.yaml"

# Wait for databases to be ready before continuing
echo "Waiting for databases to be ready..."
kubectl -n scanpro wait --for=condition=available --timeout=300s deployment/postgres
kubectl -n scanpro wait --for=condition=available --timeout=300s deployment/redis

# Apply backend configuration
echo "Creating backend configuration..."
kubectl apply -f "$MANIFESTS_DIR/backend/scanpro-configmap.yaml"
kubectl apply -f "$MANIFESTS_DIR/backend/scanpro-secret.yaml"

# Deploy backend
echo "Deploying ScanPro backend..."
kubectl apply -f "$MANIFESTS_DIR/backend/scanpro-deployment.yaml"
kubectl apply -f "$MANIFESTS_DIR/backend/scanpro-service.yaml"

# Wait for backend to be ready
echo "Waiting for ScanPro backend to be ready..."
kubectl -n scanpro wait --for=condition=available --timeout=300s deployment/scanpro

# Deploy Nginx Ingress controller
echo "Deploying Nginx Ingress controller..."
kubectl apply -f "$MANIFESTS_DIR/ingress/nginx-controller.yaml"
kubectl apply -f "$MANIFESTS_DIR/ingress/nginx-controller-continued.yaml"

# Wait for Nginx Ingress controller to be ready
echo "Waiting for Nginx Ingress controller to be ready..."
kubectl -n ingress-nginx wait --for=condition=available --timeout=300s deployment/ingress-nginx-controller

# Deploy cert-manager for TLS certificates
echo "Deploying cert-manager for TLS certificates..."
kubectl apply -f "$MANIFESTS_DIR/ingress/cert-manager.yaml"

# Wait for cert-manager to be ready
echo "Waiting for cert-manager to be ready..."
kubectl -n cert-manager wait --for=condition=available --timeout=300s deployment/cert-manager

# Finally, create the ingress resource
echo "Creating Ingress resource for ScanPro..."
kubectl apply -f "$MANIFESTS_DIR/ingress/scanpro-ingress.yaml"

# Get the Load Balancer IP or hostname
echo "Retrieving Load Balancer information..."
LOAD_BALANCER_IP=$(kubectl -n ingress-nginx get service ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
LOAD_BALANCER_HOSTNAME=$(kubectl -n ingress-nginx get service ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo ""
echo "ScanPro deployment completed successfully!"
echo ""
echo "Load Balancer IP: $LOAD_BALANCER_IP"
echo "Load Balancer Hostname: $LOAD_BALANCER_HOSTNAME"
echo ""
echo "Next steps:"
echo "1. Update your DNS records to point your domain to the Load Balancer"
echo "2. Or run './setup-cloudflare.sh' if you're using CloudFlare"
echo ""
echo "Access KubeSphere console to monitor your deployment at:"
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}')
NODEPORT=$(kubectl get svc ks-console -n kubesphere-system -o jsonpath='{.spec.ports[0].nodePort}')
echo "http://${NODE_IP}:${NODEPORT}/console/"
echo "Username: admin"
echo "Default password: P@88w0rd"