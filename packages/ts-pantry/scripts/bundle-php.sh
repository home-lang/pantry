#!/bin/bash
# Bundle PHP with all its Homebrew dependencies
# Makes PHP portable - works on any Mac without Homebrew

set -e

# Config
PHP_VERSION="${1:-8.4.17}"
PLATFORM="darwin-arm64"
BUCKET="${BUCKET:-pantry-registry}"
REGION="${REGION:-us-east-1}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${BLUE}📦 Bundling PHP ${PHP_VERSION} with dependencies${NC}"
echo ""

# Directories
WORK_DIR="/tmp/php-bundle"
INSTALL_DIR="$WORK_DIR/php.net/$PHP_VERSION"
LIB_DIR="$INSTALL_DIR/lib"
BIN_DIR="$INSTALL_DIR/bin"
ARTIFACTS_DIR="/tmp/php-bundle-artifacts"

# Clean up
rm -rf "$WORK_DIR" "$ARTIFACTS_DIR"
mkdir -p "$INSTALL_DIR" "$LIB_DIR" "$ARTIFACTS_DIR"

# Check if PHP exists in ~/.pantry
SOURCE_PHP="$HOME/.pantry/php.net/$PHP_VERSION"
if [[ ! -d "$SOURCE_PHP" ]]; then
  echo -e "${YELLOW}PHP not found in ~/.pantry, downloading from S3...${NC}"
  mkdir -p "$SOURCE_PHP"
  TARBALL_URL="https://${BUCKET}.s3.${REGION}.amazonaws.com/binaries/php.net/${PHP_VERSION}/${PLATFORM}/php-net-${PHP_VERSION}.tar.gz"
  curl -fsSL "$TARBALL_URL" | tar -xz -C "$SOURCE_PHP"
fi

# Copy PHP installation
echo -e "${BLUE}Copying PHP installation...${NC}"
cp -R "$SOURCE_PHP"/* "$INSTALL_DIR/"

# Get list of Homebrew dependencies
echo -e "${BLUE}Analyzing dependencies...${NC}"
PHP_BIN="$BIN_DIR/php"

# Get all dylib dependencies from Homebrew
HOMEBREW_LIBS=$(otool -L "$PHP_BIN" | grep '/opt/homebrew' | awk '{print $1}' | tr -d ':')

echo "Found $(echo "$HOMEBREW_LIBS" | wc -l | tr -d ' ') Homebrew libraries"

# Function to copy a dylib and its dependencies recursively
copy_lib() {
  local lib="$1"
  local lib_name=$(basename "$lib")
  local dest="$LIB_DIR/$lib_name"

  # Skip if already copied
  [[ -f "$dest" ]] && return

  # Skip if not from Homebrew
  [[ ! "$lib" =~ ^/opt/homebrew ]] && return

  echo "  Copying: $lib_name"
  cp "$lib" "$dest"

  # Get dependencies of this lib
  local sub_libs=$(otool -L "$lib" | grep '/opt/homebrew' | awk '{print $1}' | tr -d ':')
  for sub_lib in $sub_libs; do
    copy_lib "$sub_lib"
  done
}

# Copy all Homebrew libraries
echo -e "${BLUE}Copying libraries...${NC}"
for lib in $HOMEBREW_LIBS; do
  copy_lib "$lib"
done

# Also check other binaries
for bin in "$BIN_DIR"/*; do
  [[ -x "$bin" ]] || continue
  BIN_LIBS=$(otool -L "$bin" 2>/dev/null | grep '/opt/homebrew' | awk '{print $1}' | tr -d ':' || true)
  for lib in $BIN_LIBS; do
    copy_lib "$lib"
  done
done

echo "Copied $(ls -1 "$LIB_DIR" | wc -l | tr -d ' ') libraries"

# Fix library paths using install_name_tool
echo -e "${BLUE}Fixing library paths...${NC}"

fix_paths() {
  local file="$1"
  local is_lib="$2"

  # Get all Homebrew references
  local refs=$(otool -L "$file" | grep '/opt/homebrew' | awk '{print $1}' | tr -d ':')

  for ref in $refs; do
    local lib_name=$(basename "$ref")
    local new_path="@loader_path/../lib/$lib_name"

    # For libraries in lib/, use @loader_path directly
    if [[ "$is_lib" == "true" ]]; then
      new_path="@loader_path/$lib_name"
    fi

    echo "  $file: $lib_name -> $new_path"
    install_name_tool -change "$ref" "$new_path" "$file" 2>/dev/null || true
  done

  # Also fix the library's own ID if it's a dylib
  if [[ "$is_lib" == "true" && "$file" =~ \.dylib$ ]]; then
    local lib_name=$(basename "$file")
    install_name_tool -id "@loader_path/$lib_name" "$file" 2>/dev/null || true
  fi
}

# Fix binaries
echo "Fixing binaries..."
for bin in "$BIN_DIR"/*; do
  [[ -x "$bin" ]] || continue
  fix_paths "$bin" "false"
done

# Fix libraries
echo "Fixing libraries..."
for lib in "$LIB_DIR"/*.dylib; do
  [[ -f "$lib" ]] || continue
  fix_paths "$lib" "true"
done

# Verify the fix
echo ""
echo -e "${BLUE}Verifying...${NC}"
echo "PHP binary dependencies:"
otool -L "$PHP_BIN" | head -15

# Check for remaining Homebrew references
REMAINING=$(otool -L "$PHP_BIN" | grep '/opt/homebrew' || true)
if [[ -n "$REMAINING" ]]; then
  echo -e "${YELLOW}Warning: Some Homebrew references remain${NC}"
  echo "$REMAINING"
else
  echo -e "${GREEN}✓ No Homebrew references in PHP binary${NC}"
fi

# Test PHP
echo ""
echo -e "${BLUE}Testing PHP...${NC}"
if "$PHP_BIN" --version; then
  echo -e "${GREEN}✓ PHP works!${NC}"
else
  echo -e "${YELLOW}Warning: PHP test failed, but continuing...${NC}"
fi

# Check extensions
echo ""
echo "Checking database extensions..."
"$PHP_BIN" -m 2>/dev/null | grep -E 'pdo_mysql|pdo_pgsql|mysqli' || echo "(extensions may require runtime libs)"

# Create tarball
echo ""
echo -e "${BLUE}Creating tarball...${NC}"
ARTIFACT_DIR="$ARTIFACTS_DIR/php.net-${PHP_VERSION}-${PLATFORM}"
mkdir -p "$ARTIFACT_DIR"

TARBALL="php-net-${PHP_VERSION}.tar.gz"
cd "$INSTALL_DIR"
tar -czf "$ARTIFACT_DIR/$TARBALL" .

# Calculate SHA256
cd "$ARTIFACT_DIR"
shasum -a 256 "$TARBALL" > "$TARBALL.sha256"

SIZE=$(ls -lh "$TARBALL" | awk '{print $5}')
echo -e "${GREEN}✓ Created: $TARBALL ($SIZE)${NC}"

# Upload to S3
echo ""
echo -e "${BLUE}Uploading to S3...${NC}"

S3_PATH="binaries/php.net/${PHP_VERSION}/${PLATFORM}"
aws s3 cp "$ARTIFACT_DIR/$TARBALL" "s3://${BUCKET}/${S3_PATH}/$TARBALL"
aws s3 cp "$ARTIFACT_DIR/$TARBALL.sha256" "s3://${BUCKET}/${S3_PATH}/$TARBALL.sha256"

# Update metadata
echo -e "${BLUE}Updating metadata...${NC}"
METADATA_KEY="binaries/php.net/metadata.json"
METADATA=$(aws s3 cp "s3://${BUCKET}/${METADATA_KEY}" - 2>/dev/null || echo '{"name":"php.net","versions":{}}')

# Get file size in bytes
SIZE_BYTES=$(stat -f%z "$ARTIFACT_DIR/$TARBALL")
SHA256=$(cat "$ARTIFACT_DIR/$TARBALL.sha256" | awk '{print $1}')

# Update metadata with jq or simple sed
if command -v jq &>/dev/null; then
  METADATA=$(echo "$METADATA" | jq --arg v "$PHP_VERSION" --arg p "$PLATFORM" --arg t "${S3_PATH}/$TARBALL" --arg s "$SHA256" --arg sz "$SIZE_BYTES" '
    .latestVersion = $v |
    .versions[$v].platforms[$p] = {
      tarball: $t,
      sha256: $s,
      size: ($sz | tonumber),
      uploadedAt: (now | todate)
    } |
    .updatedAt = (now | todate)
  ')
else
  # Simple update without jq
  METADATA='{"name":"php.net","latestVersion":"'"$PHP_VERSION"'","versions":{"'"$PHP_VERSION"'":{"platforms":{"'"$PLATFORM"'":{"tarball":"'"${S3_PATH}/$TARBALL"'","sha256":"'"$SHA256"'","size":'"$SIZE_BYTES"'}}}}}'
fi

echo "$METADATA" | aws s3 cp - "s3://${BUCKET}/${METADATA_KEY}" --content-type "application/json"

echo ""
echo -e "${GREEN}✅ Done!${NC}"
echo ""
echo "Bundled PHP uploaded to:"
echo "  s3://${BUCKET}/${S3_PATH}/$TARBALL"
echo ""
echo "Package size: $SIZE (includes all dependencies)"
echo ""
echo "Test on a fresh Mac (without Homebrew):"
echo "  curl -fsSL https://pantry-registry.s3.us-east-1.amazonaws.com/install.sh | bash"
echo "  # Then cd into a project with deps.yaml containing php.net"
