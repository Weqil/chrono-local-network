#!/usr/bin/env bash
set -euo pipefail

IMAGE="${DOCKER_IMAGE:-weqil/chrono-local-network}"
TAG="${DOCKER_TAG:-latest}"
PLATFORM="${DOCKER_PLATFORM:-linux/amd64,linux/arm64}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Building and pushing ${IMAGE}:${TAG} (${PLATFORM})..."

docker buildx create --use --name chrono-local-network-builder 2>/dev/null || docker buildx use chrono-local-network-builder

docker buildx build \
  --platform "${PLATFORM}" \
  --tag "${IMAGE}:${TAG}" \
  --push \
  .

echo "Done: ${IMAGE}:${TAG}"
