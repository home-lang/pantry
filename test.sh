#!/bin/bash

echo "🧪 Testing PHP Build - Simplified Approach..."

cd /Users/chrisbreuer/Code/launchpad

echo "1. Testing basic compilation with libintl..."
mkdir -p /tmp/simple-test
cd /tmp/simple-test

echo '#include <libintl.h>' > test.c
echo 'int main() { bindtextdomain("test", "."); return 0; }' >> test.c

echo "2. Testing libintl compilation..."
clang -I/Users/chrisbreuer/.local/gnu.org/gettext/v0.22.5/include \
      -L/Users/chrisbreuer/.local/gnu.org/gettext/v0.22.5/lib \
      -Wl,-rpath,/Users/chrisbreuer/.local/gnu.org/gettext/v0.22.5/lib \
      -lintl test.c -o test

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
/Users/chrisbreuer/.local/gnu.org/wget/v1.25.0/bin/wget --no-check-certificate -O php-8.3.13.tar.gz https://www.php.net/distributions/php-8.3.13.tar.gz

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
