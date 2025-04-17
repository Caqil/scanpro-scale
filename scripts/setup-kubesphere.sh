#!/bin/bash
set -e

# Function to check command existence
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "$1 is not installed. Please install $1 first."
        exit 1
    fi
}

# Check required commands
check_command kubectl
check_command curl
check_command jq

# Check Kubernetes cluster accessibility
if ! kubectl cluster-info &> /dev/null; then
    echo "Kubernetes cluster is not accessible. Please check your cluster configuration."
    exit 1
fi

# Verify Kubernetes version compatibility (minimum v1.22.0 for KubeSphere v4.0.0)
K8S_VERSION=$(kubectl version --short | grep Server | awk '{print $3}' | cut -d'+' -f1)
MIN_VERSION="v1.22.0"
if [[ "$(printf '%s\n' "${K8S_VERSION}" "${MIN_VERSION}" | sort -V | head -n1)" != "${MIN_VERSION}" ]]; then
    echo "Kubernetes version ${K8S_VERSION} is not supported. Minimum required version is ${MIN_VERSION}"
    exit 1
fi

echo "Installing KubeSphere v3.4.1 with App Store on traditional Kubernetes..."

# Create namespace if it doesn't exist
kubectl create namespace kubesphere-system --dry-run=client -o yaml | kubectl apply -f -

# Download and modify cluster-configuration.yaml to enable App Store
CONFIG_URL="https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/cluster-configuration.yaml"
curl -sSL "${CONFIG_URL}" -o cluster-configuration.yaml

# Enable OpenPitrix (App Store)
cat <<EOF > patch.yaml
spec:
  openpitrix:
    store:
      enabled: true
EOF
kubectl kustomize --resources cluster-configuration.yaml --patch patch.yaml > modified-cluster-configuration.yaml

# Apply KubeSphere installer
INSTALLER_URL="https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/kubesphere-installer.yaml"
curl -sSL "${INSTALLER_URL}" | kubectl apply -f -

# Apply modified cluster configuration
kubectl apply -f modified-cluster-configuration.yaml

# Clean up temporary files
rm -f cluster-configuration.yaml patch.yaml modified-cluster-configuration.yaml

echo "KubeSphere installation initiated. This may take 15-20 minutes."
echo "To monitor installation progress, run:"
echo "kubectl logs -n kubesphere-system \$(kubectl get pod -n kubesphere-system -l 'app in (ks-install, ks-installer)' -o jsonpath='{.items[0].metadata.name}') -f"

# Wait for KubeSphere components with timeout (30 minutes)
TIMEOUT=1800
START_TIME=$(date +%s)
while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED_TIME=$((CURRENT_TIME - START_TIME))
    
    if [ $ELAPSED_TIME -gt $TIMEOUT ]; then
        echo "Error: Timeout waiting for KubeSphere to be ready"
        exit 1
    fi

    # Check if ks-console and App Store components are running
    if kubectl get pods -n kubesphere-system -l app=ks-console -o jsonpath='{.items[0].status.phase}' 2>/dev/null | grep -q "Running" && \
       kubectl get pods -n kubesphere-system -l app=openpitrix -o jsonpath='{.items[0].status.phase}' 2>/dev/null | grep -q "Running"; then
        # Verify all containers are ready
        CONSOLE_READY=$(kubectl get pods -n kubesphere-system -l app=ks-console -o jsonpath='{.items[0].status.containerStatuses[0].ready}')
        APPSTORE_READY=$(kubectl get pods -n kubesphere-system -l app=openpitrix -o jsonpath='{.items[0].status.containerStatuses[0].ready}')
        if [ "$CONSOLE_READY" = "true" ] && [ "$APPSTORE_READY" = "true" ]; then
            break
        fi
    fi
    
    echo "Waiting for KubeSphere console and App Store to be ready... (${ELAPSED_TIME}s elapsed)"
    sleep 30
done

# Get access information
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null || \
          kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')
NODEPORT=$(kubectl get svc ks-console -n kubesphere-system -o jsonpath='{.spec.ports[0].nodePort}')

# Check if service is exposed via Ingress
INGRESS_HOST=""
if kubectl get ingress -n kubesphere-system ks-console &>/dev/null; then
    INGRESS_HOST=$(kubectl get ingress -n kubesphere-system ks-console -o jsonpath='{.spec.rules[0].host}')
fi

echo "KubeSphere v3.4.1installed successfully!"
if [ -n "$INGRESS_HOST" ]; then
    echo "KubeSphere console: http://${INGRESS_HOST}/console/"
else
    echo "KubeSphere console: http://${NODE_IP}:${NODEPORT}/console/"
fi
echo "App Store: Accessible via the KubeSphere console under 'App Store'"
echo "Default credentials:"
echo "Username: admin"
echo "Password: P@88w0rd"
echo ""
echo "Note: For production environments, change the default password immediately."
echo "To verify all components, run: kubectl get pods -n kubesphere-system"
echo "To confirm App Store is enabled, check for 'openpitrix' pods in the kubesphere-system namespace."