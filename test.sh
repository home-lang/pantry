#!/bin/bash

echo "🧪 Testing PHP Build - Simplified Approach..."

cd "$(dirname "$0")"

echo "1. Testing basic compilation with libintl..."
mkdir -p /tmp/simple-test
cd /tmp/simple-test

echo '#include <libintl.h>' > test.c
echo 'int main() { bindtextdomain("test", "."); return 0; }' >> test.c

echo "2. Testing libintl compilation..."
# Use dynamic paths instead of hardcoded ones
GETTEXT_DIR="$HOME/.local/gnu.org/gettext/v0.22.5"
if [ ! -d "$GETTEXT_DIR" ]; then
  echo "⚠️ Gettext not found at $GETTEXT_DIR, using system libraries"
  clang -lintl test.c -o test
else
  clang -I"$GETTEXT_DIR/include" \
        -L"$GETTEXT_DIR/lib" \
        -Wl,-rpath,"$GETTEXT_DIR/lib" \
        -lintl test.c -o test
fi

if [ $? -eq 0 ]; then
  echo "✅ libintl compilation successful"
  ./test && echo "✅ libintl runtime successful"
else
  echo "❌ libintl compilation failed"
fi

echo "3. Testing minimal PHP configure..."
mkdir -p /tmp/minimal-php
cd /tmp/minimal-php

echo "4. Downloading PHP source..."
# Use curl instead of hardcoded wget path
curl -L -k -o php-8.3.13.tar.gz https://www.php.net/distributions/php-8.3.13.tar.gz

echo "5. Extracting and configuring..."
tar -xzf php-8.3.13.tar.gz
cd php-8.3.13
./buildconf --force

echo "6. Simple configure test..."
CC=clang ./configure \
  --prefix=/tmp/minimal-php/output \
  --disable-all \
  --enable-cli \
  --disable-cgi \
  --disable-fpm \
  --without-pear \
  --without-pcre-jit

if [ $? -eq 0 ]; then
  echo "✅ Minimal configure successful!"
  echo "7. Attempting build..."
  make -j2
  
  if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    make install
    
    if [ -f "/tmp/minimal-php/output/bin/php" ]; then
      echo "🎉 SUCCESS! Minimal PHP binary created:"
      /tmp/minimal-php/output/bin/php --version
    else
      echo "❌ PHP binary not found"
    fi
  else
    echo "❌ Build failed"
  fi
else
  echo "❌ Configure failed - checking config.log..."
  tail -20 config.log
fi
