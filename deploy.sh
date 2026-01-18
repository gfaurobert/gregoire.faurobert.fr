#!/bin/bash

# Deploy script for Hugo static site
# Usage: ./deploy.sh [site|nginx]

set -e  # Exit on error

SOURCE_DIR="/home/gregoire/gregoire.faurobert.fr/public"
TARGET_DIR="/var/www/cv-gregor-faurobert"
NGINX_USER="www-data"
NGINX_GROUP="www-data"
WORKING_DIR="/home/gregoire/gregoire.faurobert.fr"
NGINX_CONF="$WORKING_DIR/nginx.conf"
NGINX_SITE_NAME="cv.gregor.faurobert.fr"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled/$NGINX_SITE_NAME.conf"

function deploy_site() {
    echo "🚀 Starting site deployment..."

    # Check if source directory exists
    if [ ! -d "$SOURCE_DIR" ]; then
        echo "❌ Error: Source directory $SOURCE_DIR does not exist"
        exit 1
    fi

    # Create target directory if it doesn't exist
    if [ ! -d "$TARGET_DIR" ]; then
        echo "📁 Creating target directory: $TARGET_DIR"
        sudo mkdir -p "$TARGET_DIR"
    fi

    # Copy files from public to target directory
    echo "📋 Copying files from $SOURCE_DIR to $TARGET_DIR"
    sudo rsync -av --delete "$SOURCE_DIR/" "$TARGET_DIR/"

    # Set ownership
    echo "👤 Setting ownership to $NGINX_USER:$NGINX_GROUP"
    sudo chown -R "$NGINX_USER:$NGINX_GROUP" "$TARGET_DIR"

    # Set permissions (755 for directories, 644 for files)
    echo "🔐 Setting permissions"
    sudo find "$TARGET_DIR" -type d -exec chmod 755 {} \;
    sudo find "$TARGET_DIR" -type f -exec chmod 644 {} \;

    echo "✅ Site deployment complete!"
}

function deploy_nginx() {
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
}

# Main script logic
case "${1:-site}" in
    site)
        deploy_site
        ;;
    nginx)
        deploy_nginx
        ;;
    *)
        echo "Usage: $0 [site|nginx]"
        echo ""
        echo "  site  - Deploy site files to /var/www/cv-gregor-faurobert/"
        echo "  nginx - Deploy nginx configuration to /etc/nginx/sites-enabled/"
        exit 1
        ;;
esac
