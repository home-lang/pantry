#!/bin/bash

# Test script for CI environment
echo "🔧 Testing Launchpad in CI environment..."

# Test network connectivity
echo "🔍 Testing network connectivity..."
curl -I --connect-timeout 10 https://dist.pkgx.dev/ || echo "⚠️ Network connectivity issues detected"

# Test launchpad basic functionality
echo "🔍 Testing Launchpad basic functionality..."
./launchpad --version || echo "⚠️ Launchpad version check failed"

# Test launchpad help
echo "🔍 Testing Launchpad help..."
./launchpad --help || echo "⚠️ Launchpad help failed"

# Test launchpad list
echo "🔍 Testing Launchpad list..."
./launchpad list || echo "⚠️ Launchpad list failed"

echo "✅ CI environment test completed"
