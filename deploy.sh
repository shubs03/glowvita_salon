#!/bin/bash
echo "[INFO] Starting deployment..."
cd /home/glowvita/glowvita/glowvita_salon || exit 1

echo "[INFO] Pulling latest code..."
git pull origin main

echo "[INFO] Stopping containers..."
docker-compose -f docker-compose.prod.yml down

echo "[INFO] Building images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "[INFO] Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

echo "[INFO] Deployment completed successfully!"