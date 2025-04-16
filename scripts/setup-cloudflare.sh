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

# Check if IP is private (basic check for 10.x.x.x, 192.168.x.x, 172.16-31.x.x)
if [[ $NODE_IP =~ ^10\. ]] || [[ $NODE_IP =~ ^192\.168\. ]] || [[ $NODE_IP =~ ^172\.(1[6-9]|2[0-9]|3[0-1])\. ]]; then
    echo "Warning: $NODE_IP is a private IP. Disabling CloudFlare proxy mode."
    PROXIED=false
else
    PROXIED=true
fi

# Create DNS record in CloudFlare
echo "Creating DNS record in CloudFlare..."
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
        "type": "A",
        "name": "'${SCANPRO_DOMAIN%%.*}'",
        "content": "'$NODE_IP'",
        "ttl": 120,
        "proxied": '$PROXIED'
     }')

if [[ $(echo "$RESPONSE" | grep -c '"success":true') -eq 0 ]]; then
    echo "Failed to create DNS record: $RESPONSE"
    exit 1
fi

echo "Setting up CloudFlare Page Rules..."
# Create Page Rule for caching static assets
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/pagerules" \
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
     }')

if [[ $(echo "$RESPONSE" | grep -c '"success":true') -eq 0 ]]; then
    echo "Failed to create static assets page rule: $RESPONSE"
    exit 1
fi

# Create Page Rule for API endpoints (no caching)
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/pagerules" \
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
     }')

if [[ $(echo "$RESPONSE" | grep -c '"success":true') -eq 0 ]]; then
    echo "Failed to create API page rule: $RESPONSE"
    exit 1
fi

echo "Setting up CloudFlare SSL/TLS settings..."
# Set SSL mode to Full (Strict)
RESPONSE=$(curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/ssl" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
        "value": "strict"
     }')

if [[ $(echo "$RESPONSE" | grep -c '"success":true') -eq 0 ]]; then
    echo "Failed to set SSL settings: $RESPONSE"
    exit 1
fi

# Enable Always Use HTTPS
RESPONSE=$(curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/settings/always_use_https" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
        "value": "on"
     }')

if [[ $(echo "$RESPONSE" | grep -c '"success":true') -eq 0 ]]; then
    echo "Failed to enable Always Use HTTPS: $RESPONSE"
    exit 1
fi

echo "CloudFlare setup completed successfully!"
echo "ScanPro is now accessible at: https://$SCANPRO_DOMAIN"