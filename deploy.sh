#!/bin/bash

# Deploy script for Hugo static site
# Usage: ./deploy.sh

set -e  # Exit on error

SOURCE_DIR="/home/gregoire/gregoire.faurobert.fr/public"
TARGET_DIR="/var/www/cv-gregor-faurobert"
NGINX_USER="www-data"
NGINX_GROUP="www-data"

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

