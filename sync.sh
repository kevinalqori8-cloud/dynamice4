#!/bin/bash

# Auto-sync script for Termux
REPO_DIR="$HOME/dynamice4"
LOG_FILE="$HOME/auto-sync.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting auto-sync..." >> $LOG_FILE

cd $REPO_DIR

# Fetch latest changes
git fetch origin main >> $LOG_FILE 2>&1

# Check if there are new changes
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "[$DATE] New changes detected, pulling..." >> $LOG_FILE
    
    # Pull changes
    git pull origin main >> $LOG_FILE 2>&1
    
    # Install dependencies if package.json changed
    if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
        echo "[$DATE] Installing dependencies..." >> $LOG_FILE
        npm install >> $LOG_FILE 2>&1
    fi
    
    echo "[$DATE] Sync completed!" >> $LOG_FILE
    
    # Notifikasi sukses
    termux-notification -t "✅ Auto-Sync Success" -c "Repository updated!" --priority high
else
    echo "[$DATE] No new changes" >> $LOG_FILE
fi

