#!/bin/bash

# Test script for CI environment
echo "🔧 Testing pantry in CI environment..."

# Test network connectivity
echo "🔍 Testing network connectivity..."
curl -I --connect-timeout 10 https://dist.pkgx.dev/ || echo "⚠️ Network connectivity issues detected"

# Test pantry basic functionality
echo "🔍 Testing pantry basic functionality..."
./pantry --version || echo "⚠️ pantry version check failed"

# Test pantry help
echo "🔍 Testing pantry help..."
./pantry --help || echo "⚠️ pantry help failed"

# Test pantry list
echo "🔍 Testing pantry list..."
./pantry list || echo "⚠️ pantry list failed"

echo "✅ CI environment test completed"
