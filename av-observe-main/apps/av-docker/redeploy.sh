#!/bin/bash

# Navigate to project root (adjust this path as needed)
cd /Users/patrickgi/Documents/Dev/av-observe

# Stop containers
echo "Stopping containers..."
docker-compose -f apps/av-docker/docker-compose.yml down

# Remove old image
echo "Removing old image..."
docker rmi av-metrics-exporter:latest --force

# Build new image
echo "Building new image..."
docker build -t av-metrics-exporter:latest -f apps/av-docker/dockerfile .

# Start containers
echo "Starting containers..."
docker-compose -f apps/av-docker/docker-compose.yml up -d

# Show logs
echo "Showing logs..."
docker logs av-collector