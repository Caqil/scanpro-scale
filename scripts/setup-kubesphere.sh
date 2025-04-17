#!/bin/bash
set -e

# Function to install a command if missing (Ubuntu-specific)
install_command() {
    local cmd=$1
    local pkg=$2
    if ! command -v "$cmd" &> /dev/null; then
        echo "$cmd is not installed. Installing $pkg..."
        sudo apt-get update
        sudo apt-get install -y "$pkg"
    else
        echo "$cmd is already installed."
    fi
}

# Function to install yq (YAML processor)
install_yq() {
    if ! command -v yq &> /dev/null; then
        echo "Installing yq..."
        sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
        sudo chmod +x /usr/local/bin/yq
        echo "yq installed successfully."
    else
        echo "yq is already installed."
    fi
}

# Function to install Kubernetes components (kubectl, kubeadm, kubelet)
install_kubernetes() {
    echo "Installing Kubernetes components (kubectl, kubeadm, kubelet)..."
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl
    # Add Kubernetes apt repository
    curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
    echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
    # Install components (force overwrite if older versions exist)
    sudo apt-get update
    sudo apt-get install -y --allow-downgrades --allow-remove-essential --allow-change-held-packages kubectl kubeadm kubelet
    # Hold versions to prevent accidental upgrades
    sudo apt-mark hold kubectl kubeadm kubelet
    echo "Kubernetes components installed successfully."
}

# Function to install containerd (container runtime)
install_containerd() {
    if ! command -v containerd &> /dev/null; then
        echo "Installing containerd..."
        sudo apt-get update
        sudo apt-get install -y containerd
        # Configure containerd
        sudo mkdir -p /etc/containerd
        containerd config default | sudo tee /etc/containerd/config.toml
        # Enable systemd cgroup driver
        sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
        sudo systemctl restart containerd
        sudo systemctl enable containerd
        echo "containerd installed and configured."
    else
        echo "containerd is already installed."
    fi
}

# Function to set up a single-node Kubernetes cluster
setup_kubernetes_cluster() {
    # Check if cluster is already initialized
    if kubectl cluster-info &> /dev/null; then
        echo "Kubernetes cluster is already accessible. Skipping cluster setup."
        return
    fi

    echo "Setting up a single-node Kubernetes cluster with kubeadm..."
    # Disable swap
    sudo swapoff -a
    sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

    # Configure kernel modules and sysctl
    cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
    sudo modprobe overlay
    sudo modprobe br_netfilter

    cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
    sudo sysctl --system

    # Initialize cluster
    sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --kubernetes-version=v1.31.0

    # Set up kubeconfig for non-root user
    mkdir -p $HOME/.kube
    sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    sudo chown $(id -u):$(id -g) $HOME/.kube/config

    # Allow control plane to run pods (single-node setup)
    kubectl taint nodes --all node-role.kubernetes.io/control-plane- &> /dev/null || true

    # Install CNI (Flannel)
    echo "Installing Flannel CNI..."
    kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml

    # Wait for cluster to be ready
    echo "Waiting for cluster to be ready..."
    until kubectl get nodes | grep -q "Ready"; do
        echo "Waiting for nodes to be ready..."
        sleep 10
    done

    # Set up a default storage class (local-path)
    if ! kubectl get storageclass | grep -q "default"; then
        echo "No default storage class found. Installing local-path storage..."
        kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml
        kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
    fi

    echo "Kubernetes cluster set up successfully."
}

# Install dependencies
echo "Checking and installing dependencies..."
install_command curl curl
install_command jq jq
install_yq
install_kubernetes
install_containerd

# Set up Kubernetes cluster
setup_kubernetes_cluster

# Verify Kubernetes version (minimum v1.22.0 for KubeSphere v4.0.0)
K8S_VERSION=$(kubectl version -o json | jq -r '.serverVersion.gitVersion' | cut -d'+' -f1)
MIN_VERSION="v1.22.0"
if [[ "$(printf '%s\n' "${K8S_VERSION}" "${MIN_VERSION}" | sort -V | head -n1)" != "${MIN_VERSION}" ]]; then
    echo "Kubernetes version ${K8S_VERSION} is not supported. Minimum required version is ${MIN_VERSION}"
    exit 1
fi

echo "Installing KubeSphere v3.4.1 with App Store on traditional Kubernetes..."

# Create namespace if it doesn't exist
kubectl create namespace kubesphere-system --dry-run=client -o yaml | kubectl apply -f -

# Download cluster-configuration.yaml
CONFIG_URL="https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/cluster-configuration.yaml"
curl -sSL "${CONFIG_URL}" -o cluster-configuration.yaml

# Enable OpenPitrix (App Store) using yq
yq eval '.spec.openpitrix.store.enabled = true' cluster-configuration.yaml > modified-cluster-configuration.yaml

# Apply KubeSphere installer
INSTALLER_URL="https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/kubesphere-installer.yaml"
curl -sSL "${INSTALLER_URL}" | kubectl apply -f -

# Apply modified cluster configuration
kubectl apply -f modified-cluster-configuration.yaml

# Clean up temporary files
rm -f cluster-configuration.yaml modified-cluster-configuration.yaml

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
        echo "Check pod statuses and events:"
        kubectl get pods -n kubesphere-system -o wide
        kubectl describe pod -n kubesphere-system -l app=ks-console
        kubectl describe pod -n kubesphere-system -l app=openpitrix
        exit 1
    fi

    # Check pod statuses
    CONSOLE_STATUS=$(kubectl get pods -n kubesphere-system -l app=ks-console -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "NotFound")
    OPENPITRIX_STATUS=$(kubectl get pods -n kubesphere-system -l app=openpitrix -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "NotFound")
    CONSOLE_READY=$(kubectl get pods -n kubesphere-system -l app=ks-console -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null || echo "false")
    OPENPITRIX_READY=$(kubectl get pods -n kubesphere-system -l app=openpitrix -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null || echo "false")

    echo "KubeSphere console status: $CONSOLE_STATUS (Ready: $CONSOLE_READY)"
    echo "OpenPitrix status: $OPENPITRIX_STATUS (Ready: $OPENPITRIX_READY)"

    if [ "$CONSOLE_STATUS" = "Running" ] && [ "$OPENPITRIX_STATUS" = "Running" ] && \
       [ "$CONSOLE_READY" = "true" ] && [ "$OPENPITRIX_READY" = "true" ]; then
        break
    fi

    # Show pod events if not running
    if [ "$CONSOLE_STATUS" != "Running" ] || [ "$OPENPITRIX_STATUS" != "Running" ]; then
        echo "Checking pod events..."
        kubectl describe pod -n kubesphere-system -l app=ks-console | tail -n 10
        kubectl describe pod -n kubesphere-system -l app=openpitrix | tail -n 10
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

echo "KubeSphere v4.0.0 installed successfully!"
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
