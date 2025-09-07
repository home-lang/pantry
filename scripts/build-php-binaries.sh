#!/bin/bash

# Build PHP binaries compatible with available ICU version
# Usage: ./scripts/build-php-binaries.sh [--icu-version=71]

set -euo pipefail

# Default values
ICU_VERSION=""
PHP_VERSION="8.4.11"
BUILD_DIR="/tmp/php-build-$$"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --icu-version=*)
      ICU_VERSION="${1#*=}"
      shift
      ;;
    --php-version=*)
      PHP_VERSION="${1#*=}"
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--icu-version=VERSION] [--php-version=VERSION]"
      echo "  --icu-version   ICU version to build against (e.g., 71, 73)"
      echo "  --php-version   PHP version to build (default: 8.4.11)"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Detect available ICU version if not specified
if [[ -z "$ICU_VERSION" ]]; then
  echo "🔍 Detecting available ICU version..."
  
  # Check launchpad environment for ICU
  ICU_DIRS=(
    "$HOME/.local/unicode.org"
    "$HOME/.local/share/launchpad/global/unicode.org"
  )
  
  for icu_dir in "${ICU_DIRS[@]}"; do
    if [[ -d "$icu_dir" ]]; then
      # Find the highest version
      ICU_VERSION=$(find "$icu_dir" -name "v*" -type d | sed 's/.*v//' | sort -V | tail -1 | cut -d. -f1)
      if [[ -n "$ICU_VERSION" ]]; then
        echo "✅ Found ICU v$ICU_VERSION in $icu_dir"
        break
      fi
    fi
  done
  
  if [[ -z "$ICU_VERSION" ]]; then
    echo "❌ No ICU version found. Please install ICU first or specify --icu-version"
    exit 1
  fi
fi

echo "🏗️  Building PHP $PHP_VERSION with ICU v$ICU_VERSION compatibility"

# Create build directory
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# Download PHP source
echo "📥 Downloading PHP $PHP_VERSION source..."
curl -L "https://www.php.net/distributions/php-$PHP_VERSION.tar.gz" -o "php-$PHP_VERSION.tar.gz"
tar -xzf "php-$PHP_VERSION.tar.gz"
cd "php-$PHP_VERSION"

# Find ICU installation
ICU_PREFIX=""
for icu_dir in "${ICU_DIRS[@]}"; do
  icu_path="$icu_dir/v$ICU_VERSION"
  if [[ -d "$icu_path" ]]; then
    ICU_PREFIX="$icu_path"
    break
  fi
  # Try with patch version
  icu_path="$icu_dir/v$ICU_VERSION.1.0"
  if [[ -d "$icu_path" ]]; then
    ICU_PREFIX="$icu_path"
    break
  fi
done

if [[ -z "$ICU_PREFIX" ]]; then
  echo "❌ ICU v$ICU_VERSION installation not found"
  exit 1
fi

echo "📍 Using ICU from: $ICU_PREFIX"

# Configure PHP build
echo "⚙️  Configuring PHP build..."
./configure \
  --prefix="/tmp/php-install" \
  --with-icu-dir="$ICU_PREFIX" \
  --enable-intl \
  --with-openssl \
  --with-curl \
  --with-zlib \
  --enable-mbstring \
  --enable-opcache \
  --enable-pdo \
  --with-pdo-mysql \
  --with-pdo-pgsql \
  --with-mysqli \
  --enable-sockets \
  --enable-bcmath \
  --enable-gd \
  --with-jpeg \
  --with-png \
  --with-freetype \
  --enable-zip \
  --with-libzip \
  --enable-soap \
  --enable-xml \
  --enable-xmlreader \
  --enable-xmlwriter \
  --with-xsl \
  --enable-filter \
  --enable-json \
  --enable-session \
  --enable-tokenizer \
  --enable-ctype \
  --enable-dom \
  --enable-simplexml \
  --enable-fileinfo \
  --enable-posix \
  --enable-pcntl \
  --enable-shmop \
  --enable-sysvmsg \
  --enable-sysvsem \
  --enable-sysvshm

# Build PHP
echo "🔨 Building PHP (this may take a while)..."
make -j$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)

# Install to temporary location
echo "📦 Installing PHP..."
make install

# Create package structure
PACKAGE_DIR="/tmp/php-package-$PHP_VERSION-icu$ICU_VERSION"
mkdir -p "$PACKAGE_DIR/bin"

# Copy binaries
cp /tmp/php-install/bin/php "$PACKAGE_DIR/bin/php.original"
cp /tmp/php-install/bin/php-config "$PACKAGE_DIR/bin/" 2>/dev/null || true
cp /tmp/php-install/bin/phpize "$PACKAGE_DIR/bin/" 2>/dev/null || true

# Create package info
cat > "$PACKAGE_DIR/package.json" << EOF
{
  "name": "php",
  "version": "$PHP_VERSION",
  "description": "PHP $PHP_VERSION built with ICU v$ICU_VERSION",
  "icu_version": "$ICU_VERSION",
  "build_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "platform": "$(uname -s)-$(uname -m)"
}
EOF

# Create tarball
echo "📦 Creating package..."
cd "$(dirname "$PACKAGE_DIR")"
tar -czf "php-$PHP_VERSION-icu$ICU_VERSION-$(uname -s)-$(uname -m).tar.gz" "$(basename "$PACKAGE_DIR")"

echo "✅ PHP binary package created: $(pwd)/php-$PHP_VERSION-icu$ICU_VERSION-$(uname -s)-$(uname -m).tar.gz"
echo ""
echo "📋 Next steps:"
echo "1. Upload this package to your binary distribution system"
echo "2. Update launchpad to use this ICU-compatible version"
echo "3. Test PHP installation with: php --version"

# Cleanup
cd /
rm -rf "$BUILD_DIR"
rm -rf "/tmp/php-install"
rm -rf "$PACKAGE_DIR"

echo "🧹 Cleanup completed"
