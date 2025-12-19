#!/bin/bash

set -e

echo "Deploying Elegance..."
docker stop elegance 2>/dev/null || true
docker rm elegance 2>/dev/null || true
docker rmi ghcr.io/imrany/elegance 2>/dev/null || true
docker pull ghcr.io/imrany/elegance:latest
docker run -d --name elegance --env-file .env -p 8082:8082 -v ~/.elegance:/var/opt/elegance ghcr.io/imrany/elegance:latest
echo "Deployment complete. Showing logs:"
docker logs elegance
