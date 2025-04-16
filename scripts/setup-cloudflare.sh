#!/bin/bash
set -e

# This script sets up CloudFlare DNS and configurations for ScanPro
# Requirements:
# - CloudFlare CLI (cloudflared) installed
# - CloudFlare API token with Zone:Edit permissions

# Configuration - Update these values
CLOUDFLARE_API_TOKEN="7JJ8bTmb5GbtrMc_u7C9k4wqvl53ZHePNx5wWLf0"
CLOUDFLARE_ZONE_ID="b07f037fca32cce9a5a6bceb8197490c"
CLOUDFLARE_ZONE="scanpro.cc"
SCANPRO_DOMAIN="scanpro.cc"

# Get node IP and port
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}')
HTTP_PORT=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.spec.ports[?(@.name=="http")].nodePort}')

if [ -z "$NODE_IP" ] || [ -z "$HTTP_PORT" ]; then
    echo "Failed to get Node IP or HTTP Port. Make sure the ingress-nginx service is running."
    exit 1
fi

echo "Node IP: $NODE_IP"
echo "HTTP Port: $HTTP_PORT"

# Create DNS record in CloudFlare
echo "Creating DNS record in CloudFlare..."
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
        "type": "A",
        "name": "'${SCANPRO_DOMAIN%%.*}'",
        "content": "'$NODE_IP'",
        "ttl": 120,
        "proxied": true
     }'

echo "Setting up CloudFlare Page Rules..."
# Create Page Rule for caching static assets
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/pagerules" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
        "targets": [
            {
                "target": "url",
                "constraint": {
                    "operator": "matches",
                    "value": "'$SCANPRO_DOMAIN'/_next/static/*"
                }
            }
        ],
        "actions": [
            {
                "id": "cache_level",
                "value": "cache_everything"
            },
            {
                "id": "edge_cache_ttl",
                "value": 86400
            }
        ],
        "status": "active",
        "priority": 1
     }'

# Create Page Rule for API endpoints (no caching)
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/pagerules" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
        "targets": [
            {
                "target": "url",
                "constraint": {
                    "operator": "matches",
                    "value": "'$SCANPRO_DOMAIN'/api/*"
                }
            }
        ],
        "actions": [
            {
                "id": "cache_level",
                "value": "bypass"
            }
        ],
        "status": "active",
        "priority": 2
     }'

echo "Setting up CloudFlare SSL/TLS settings..."
# Set SSL mode to Full (Strict)
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/ssl" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
        "value": "strict"
     }'

# Enable Always Use HTTPS
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/always_use_https" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
        "value": "on"
     }'

echo "CloudFlare setup completed successfully!"
echo "ScanPro is now accessible at: https://$SCANPRO_DOMAIN"