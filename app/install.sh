#!/bin/bash
# Direct PDF Converter Installation Script

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Starting PDF Converter Installation ===${NC}"

# Define variables
APP_PORT=3001
DOMAIN="scanpro.cc"
APP_USER="pdf-converter"
APP_DIR="/home/${APP_USER}/scanpro"
REPO_URL="https://github.com/Caqil/scanpro.git"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run this script as root or with sudo${NC}"
  exit 1
fi

# Install necessary packages
echo -e "${GREEN}Installing dependencies...${NC}"
apt-get update
apt-get install -y nodejs npm git ghostscript poppler-utils qpdf pdftk libreoffice imagemagick nginx

# Install PM2 globally
echo -e "${GREEN}Installing PM2...${NC}"
npm install -g pm2

# Create app user if it doesn't exist
if ! id "${APP_USER}" &>/dev/null; then
    echo -e "${GREEN}Creating user ${APP_USER}...${NC}"
    useradd -m -s /bin/bash "${APP_USER}"
fi

# Remove any existing directory if it exists
if [ -d "${APP_DIR}" ]; then
    echo -e "${YELLOW}Removing existing directory...${NC}"
    rm -rf "${APP_DIR}"
fi

# Create app directory
echo -e "${GREEN}Creating application directory...${NC}"
mkdir -p "${APP_DIR}"

# Clone repository as root
echo -e "${GREEN}Cloning repository...${NC}"
git clone ${REPO_URL} "${APP_DIR}"

# Change ownership to app user
echo -e "${GREEN}Setting permissions...${NC}"
chown -R "${APP_USER}:${APP_USER}" "/home/${APP_USER}"
chmod -R 755 "${APP_DIR}"

# Create needed directories
echo -e "${GREEN}Creating required directories...${NC}"
mkdir -p "${APP_DIR}/uploads" "${APP_DIR}/temp" "${APP_DIR}/temp-conversions"
mkdir -p "${APP_DIR}/public/conversions" "${APP_DIR}/public/compressions" "${APP_DIR}/public/merges" 
mkdir -p "${APP_DIR}/public/splits" "${APP_DIR}/public/rotations" "${APP_DIR}/public/watermarks"
mkdir -p "${APP_DIR}/public/protected" "${APP_DIR}/public/unlocked" "${APP_DIR}/public/signatures"
mkdir -p "${APP_DIR}/public/edited" "${APP_DIR}/public/ocr"

# Set permissions
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"
chmod -R 755 "${APP_DIR}/uploads" "${APP_DIR}/public/"*/

# Create .env file
echo -e "NODE_ENV=production\nPORT=${APP_PORT}" > "${APP_DIR}/.env"
chown "${APP_USER}:${APP_USER}" "${APP_DIR}/.env"

# Install dependencies and build as the app user
echo -e "${GREEN}Installing Node.js dependencies and building...${NC}"
su - "${APP_USER}" -c "cd ${APP_DIR} && npm install && npm run build"

# Create PM2 ecosystem file
echo -e "${GREEN}Creating PM2 ecosystem configuration...${NC}"
cat > "${APP_DIR}/ecosystem.config.js" << EOL
module.exports = {
  apps: [{
    name: "pdf-converter",
    cwd: "${APP_DIR}",
    script: "npm",
    args: "start",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: ${APP_PORT}
    }
  }]
};
EOL
chown "${APP_USER}:${APP_USER}" "${APP_DIR}/ecosystem.config.js"

# Configure Nginx
echo -e "${GREEN}Setting up Nginx configuration...${NC}"
cat > "/etc/nginx/sites-available/${DOMAIN}.conf" << EOL
server {
    listen 443 ssl;
    server_name scanpro.cc;

    ssl_certificate /etc/ssl/cert_sp.pem;
    ssl_certificate_key /etc/ssl/key_sp.pem;
    ssl_client_certificate /etc/ssl/cloudflare.crt;
    ssl_verify_client on;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!RC4';

    root ${APP_DIR}/.next; 
    index index.html index.htm;

    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /_next/static/ {
        alias ${APP_DIR}/.next/static/;
        access_log off;
        expires 1y;
        add_header Cache-Control "public";
    }

    location ~ /\\.(?!well-known).* {
        deny all;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}

server {
    listen 80;
    server_name scanpro.cc;
    return 301 https://\$host\$request_uri;
}
EOL

# Enable the site
ln -sf "/etc/nginx/sites-available/${DOMAIN}.conf" "/etc/nginx/sites-enabled/${DOMAIN}.conf"

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Start with PM2
echo -e "${GREEN}Starting application with PM2...${NC}"
su - "${APP_USER}" -c "cd ${APP_DIR} && pm2 start ecosystem.config.js"
su - "${APP_USER}" -c "pm2 save"

# Setup PM2 to start on boot
env PATH=$PATH:/usr/bin pm2 startup systemd -u "${APP_USER}" --hp "/home/${APP_USER}"
systemctl enable pm2-${APP_USER}

echo -e "${GREEN}=== Installation Complete! ===${NC}"
echo -e "PDF Converter is now running at https://${DOMAIN}"
echo -e "Check PM2 status with: sudo -u ${APP_USER} pm2 status"
