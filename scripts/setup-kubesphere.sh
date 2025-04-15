#!/bin/bash
set -e

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if kubernetes cluster is running
if ! kubectl cluster-info &> /dev/null; then
    echo "Kubernetes cluster is not accessible. Please check your cluster."
    exit 1
fi

echo "Installing KubeSphere..."

# Create namespace for kubesphere
kubectl create namespace kubesphere-system

# Apply KubeSphere minimal installation
kubectl apply -f https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/kubesphere-installer.yaml

# Apply KubeSphere configuration
kubectl apply -f https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/cluster-configuration.yaml

echo "KubeSphere installation initiated. This may take 15-20 minutes."
echo "You can check the installation status with:"
echo "kubectl logs -n kubesphere-system \$(kubectl get pod -n kubesphere-system -l 'app in (ks-install, ks-installer)' -o jsonpath='{.items[0].metadata.name}') -f"

# Wait for KubeSphere to be ready
echo "Waiting for KubeSphere to be ready..."
while ! kubectl get pods -n kubesphere-system | grep ks-console | grep -q Running; do
    echo "Waiting for KubeSphere console to be running..."
    sleep 30
done

# Get KubeSphere console URL
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}')
NODEPORT=$(kubectl get svc ks-console -n kubesphere-system -o jsonpath='{.spec.ports[0].nodePort}')

echo "KubeSphere is installed successfully!"
echo "KubeSphere console: http://${NODE_IP}:${NODEPORT}/console/"
echo "Default account: admin"
echo "Default password: P@88w0rd"