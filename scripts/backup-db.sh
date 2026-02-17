#!/bin/bash

# Database Backup Script
# Usage: ./scripts/backup-db.sh

# Create backups directory if it doesn't exist
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup filename
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "🔄 Creating database backup..."

# Perform backup (adjust based on your database)
# For PostgreSQL:
if [ -n "$DATABASE_URL" ]; then
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup created successfully: $BACKUP_FILE"
        
        # Get file size
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        echo "📦 Backup size: $SIZE"
        
        # Keep only last 10 backups
        cd "$BACKUP_DIR"
        ls -t backup_*.sql | tail -n +11 | xargs -r rm
        echo "🧹 Cleaned old backups (keeping last 10)"
    else
        echo "❌ Backup failed!"
        exit 1
    fi
else
    echo "❌ DATABASE_URL not set!"
    exit 1
fi

echo "✅ Backup complete!"
