#!/bin/bash
set -e

# Build and Upload Package to S3
# Usage: ./scripts/build-and-upload.sh <package> <version> [bucket] [region]
# Example: ./scripts/build-and-upload.sh php.net 8.4.11 my-bucket us-east-1

PACKAGE="${1:?Usage: $0 <package> <version> [bucket] [region]}"
VERSION="${2:?Usage: $0 <package> <version> [bucket] [region]}"
BUCKET="${3:-pantry-registry}"
REGION="${4:-us-east-1}"

# Detect platform
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
  ARCH="arm64"
else
  ARCH="x86-64"
fi
PLATFORM="${OS}-${ARCH}"

# Directories
BUILD_DIR="/tmp/pantry-build/${PACKAGE}-${VERSION}"
INSTALL_DIR="/tmp/pantry-install/${PACKAGE}-${VERSION}"
ARTIFACTS_DIR="./artifacts"
ARTIFACT_NAME="${PACKAGE}-${VERSION}-${PLATFORM}"
ARTIFACT_DIR="${ARTIFACTS_DIR}/${ARTIFACT_NAME}"

echo "============================================================"
echo "Building ${PACKAGE}@${VERSION} for ${PLATFORM}"
echo "============================================================"
echo "Build dir: ${BUILD_DIR}"
echo "Install dir: ${INSTALL_DIR}"
echo "Bucket: ${BUCKET}"
echo "Region: ${REGION}"
echo ""

# Clean up previous builds
rm -rf "${BUILD_DIR}" "${INSTALL_DIR}" "${ARTIFACT_DIR}"
mkdir -p "${BUILD_DIR}" "${INSTALL_DIR}" "${ARTIFACT_DIR}"

# Step 1: Build
echo ""
echo ">>> Step 1: Building from source..."
bun scripts/build-package.ts \
  --package "${PACKAGE}" \
  --version "${VERSION}" \
  --platform "${PLATFORM}" \
  --build-dir "${BUILD_DIR}" \
  --prefix "${INSTALL_DIR}"

# Step 2: Package
echo ""
echo ">>> Step 2: Creating tarball..."
TARBALL="${PACKAGE}-${VERSION}.tar.gz"
cd "${INSTALL_DIR}"
tar -czf "${ARTIFACT_DIR}/${TARBALL}" .
cd - > /dev/null

# Generate SHA256
cd "${ARTIFACT_DIR}"
shasum -a 256 "${TARBALL}" > "${TARBALL}.sha256"
cd - > /dev/null

echo "Created: ${ARTIFACT_DIR}/${TARBALL}"
echo "SHA256: $(cat ${ARTIFACT_DIR}/${TARBALL}.sha256)"

# Step 3: Upload
echo ""
echo ">>> Step 3: Uploading to S3..."
bun scripts/upload-to-s3.ts \
  --package "${PACKAGE}" \
  --version "${VERSION}" \
  --artifacts-dir "${ARTIFACTS_DIR}" \
  --bucket "${BUCKET}" \
  --region "${REGION}"

# Cleanup
echo ""
echo ">>> Cleaning up build directories..."
rm -rf "${BUILD_DIR}" "${INSTALL_DIR}"

echo ""
echo "============================================================"
echo "Done! ${PACKAGE}@${VERSION} uploaded to s3://${BUCKET}/binaries/${PACKAGE}/"
echo "============================================================"
