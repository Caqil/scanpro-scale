# ScanPro Kubernetes Deployment

This repository contains all the necessary configuration files and scripts to deploy ScanPro on Kubernetes with KubeSphere.

## Architecture Overview

ScanPro is deployed with the following components:

- **ScanPro Application**: A Next.js application for PDF processing and manipulation
- **PostgreSQL**: Database for user accounts and application data
- **Redis**: For caching and rate limiting
- **Nginx Ingress Controller**: For routing and TLS termination
- **Let's Encrypt Cert Manager**: For automatic SSL certificate management
- **CloudFlare**: For DNS, CDN, and additional security features

## Prerequisites

Before deploying ScanPro, ensure you have:

1. A Kubernetes cluster (v1.22+)
2. `kubectl` CLI tool installed and configured
3. Administrative access to your Kubernetes cluster
4. Sufficient resources:
   - At least 4 worker nodes
   - Minimum 16GB RAM and 8 CPUs available
   - At least 100GB storage
5. Domain name and access to DNS settings
6. (Optional) CloudFlare account for enhanced CDN and security

## Directory Structure

```
scanpro-k8s/
├── manifests/            # Kubernetes configuration files
│   ├── namespace.yaml    # ScanPro namespace definition
│   ├── storage/          # Storage configuration
│   ├── database/         # Database deployments and services
│   ├── backend/          # ScanPro backend configuration
│   ├── ingress/          # Nginx ingress and TLS configuration
│   └── monitoring/       # Prometheus and Grafana setup (optional)
├── scripts/              # Deployment and utility scripts
│   ├── setup-kubesphere.sh    # Installs KubeSphere on Kubernetes
│   ├── deploy-scanpro.sh      # Main deployment script
│   └── setup-cloudflare.sh    # Configures CloudFlare integration
└── README.md             # This file
```

## Deployment Steps

### Step 1: Install KubeSphere (Optional but Recommended)

KubeSphere provides a user-friendly interface for managing Kubernetes resources:

```bash
chmod +x scripts/setup-kubesphere.sh
./scripts/setup-kubesphere.sh
```

Wait for the installation to complete (15-20 minutes). You can access the KubeSphere console using the URL, username, and password displayed at the end of the script.

### Step 2: Prepare Configuration

Review and update the following files with your specific settings:

1. `manifests/backend/scanpro-configmap.yaml` - Update environment variables like `NEXT_PUBLIC_APP_URL`
2. `manifests/backend/scanpro-secret.yaml` - Update base64-encoded secrets
3. `manifests/ingress/scanpro-ingress.yaml` - Update the hostname
4. `manifests/ingress/cert-manager.yaml` - Update the email address for Let's Encrypt
5. `scripts/setup-cloudflare.sh` - Update CloudFlare API token and zone information

### Step 3: Deploy ScanPro

Run the main deployment script:

```bash
chmod +x scripts/deploy-scanpro.sh
./scripts/deploy-scanpro.sh
```

This script will:

1. Create the necessary namespaces
2. Set up storage resources
3. Deploy PostgreSQL and Redis databases
4. Deploy the ScanPro application
5. Set up the Nginx Ingress Controller
6. Configure TLS certificates with Let's Encrypt

### Step 4: Configure DNS and CloudFlare (Optional)

If you're using CloudFlare, run:

```bash
chmod +x scripts/setup-cloudflare.sh
./scripts/setup-cloudflare.sh
```

Otherwise, manually update your DNS settings to point your domain to the Load Balancer IP/hostname displayed at the end of the deployment script.

## Verifying the Deployment

1. Check the status of all ScanPro pods:

   ```bash
   kubectl get pods -n scanpro
   ```

2. Check the Ingress status:

   ```bash
   kubectl get ingress -n scanpro
   ```

3. Verify the TLS certificate:

   ```bash
   kubectl get certificate -n scanpro
   ```

4. Access your ScanPro application at the configured domain (e.g., https://scanpro.example.com)

## Monitoring and Management

If you installed KubeSphere, you can:

1. Access the KubeSphere console
2. Navigate to your ScanPro project
3. Monitor workloads, services, and resources
4. View logs and metrics
5. Scale components as needed

## Troubleshooting

If you encounter issues:

1. Check pod logs:

   ```bash
   kubectl logs -n scanpro <pod-name>
   ```

2. Check pod events:

   ```bash
   kubectl describe pod -n scanpro <pod-name>
   ```

3. Check ingress controller logs:

   ```bash
   kubectl logs -n ingress-nginx <ingress-controller-pod-name>
   ```

4. Verify storage mounting:
   ```bash
   kubectl describe pvc -n scanpro
   ```

## Maintenance

### Database Backup

To back up the PostgreSQL database:

```bash
kubectl exec -n scanpro $(kubectl get pods -n scanpro -l app=postgres -o name) -- \
  pg_dump -U scanprouser scanprodb > scanpro-backup-$(date +%Y%m%d).sql
```

### Scaling

To scale the ScanPro application:

```bash
kubectl scale deployment scanpro -n scanpro --replicas=5
```

### Updating

To update the ScanPro application with a new image:

```bash
kubectl set image deployment/scanpro -n scanpro scanpro=scanpro/webapp:new-version
```

## Security Considerations

1. All sensitive configuration is stored in Kubernetes Secrets
2. TLS encryption is enabled for all external access
3. Ingress rate limiting is configured to prevent abuse
4. Network policies restrict pod communication
5. CloudFlare provides additional DDoS protection

## License

This deployment configuration is provided under the same license as the ScanPro application.
