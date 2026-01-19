#!/bin/bash

# Deploy nginx configuration script
# Usage: ./deploy-nginx.sh

set -e  # Exit on error

WORKING_DIR="/home/gregoire/gregoire.faurobert.fr"
NGINX_CONF="$WORKING_DIR/nginx.conf"
NGINX_SITE_NAME="cv.gregor.faurobert.fr"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled/$NGINX_SITE_NAME.conf"

echo "🚀 Starting nginx configuration deployment..."

# Check if nginx.conf exists
if [ ! -f "$NGINX_CONF" ]; then
    echo "❌ Error: nginx.conf not found at $NGINX_CONF"
    exit 1
fi

# Backup existing nginx config from sites-enabled if it exists
if [ -f "$NGINX_SITES_ENABLED" ]; then
    BACKUP_FILE="$WORKING_DIR/${NGINX_SITE_NAME}.conf.backup.$(date +%Y%m%d_%H%M%S)"
    echo "💾 Backing up current nginx config to $BACKUP_FILE"
    sudo cp "$NGINX_SITES_ENABLED" "$BACKUP_FILE"
    sudo chown $(whoami):$(whoami) "$BACKUP_FILE"
    echo "✅ Backup saved to $BACKUP_FILE"
else
    echo "ℹ️  No existing nginx config found at $NGINX_SITES_ENABLED"
fi

# Copy nginx.conf to sites-enabled
echo "📋 Copying nginx.conf to $NGINX_SITES_ENABLED"
sudo cp "$NGINX_CONF" "$NGINX_SITES_ENABLED"

echo "✅ Nginx configuration deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Test nginx configuration: sudo nginx -t"
echo "   2. Reload nginx: sudo systemctl reload nginx"
