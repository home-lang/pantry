#!/bin/bash

# Test script for Bun package manager environments
# This script tests all the Bun-related test environments

set -e  # Exit on any error

echo "🧪 Testing Bun Package Manager Environments"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for tests
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_dir="$2"
    local test_command="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo ""
    echo -e "${BLUE}🔍 Testing: $test_name${NC}"
    echo "Directory: $test_dir"
    echo "Command: $test_command"
    echo "----------------------------------------"
    
    cd "$test_dir"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAUNCHPAD_BIN="$SCRIPT_DIR/../bin/launchpad"

echo "Using Launchpad binary: $LAUNCHPAD_BIN"

# Test 1: Basic Bun (no version)
run_test "Basic Bun Package Manager (no version)" \
    "$SCRIPT_DIR/bun-package-manager-basic" \
    "$LAUNCHPAD_BIN install --verbose --dry-run | grep -q 'bun.sh' && ! $LAUNCHPAD_BIN install --verbose --dry-run | grep -q 'nodejs.org'"

# Test 2: Versioned Bun
run_test "Versioned Bun Package Manager" \
    "$SCRIPT_DIR/bun-package-manager-versioned" \
    "$LAUNCHPAD_BIN install --verbose --dry-run | grep -q 'bun.sh@1.2.20' && ! $LAUNCHPAD_BIN install --verbose --dry-run | grep -q 'nodejs.org'"

# Test 3: Bun with dependencies
run_test "Bun with Additional Dependencies" \
    "$SCRIPT_DIR/bun-package-manager-with-deps" \
    "$LAUNCHPAD_BIN install --verbose --dry-run | grep -q 'bun.sh' && $LAUNCHPAD_BIN install --verbose --dry-run | grep -q 'esbuild.github.io' && ! $LAUNCHPAD_BIN install --verbose --dry-run | grep -q 'nodejs.org'"

# Test 4: Bun vs Node engines conflict
run_test "Bun Package Manager vs Node Engines Conflict" \
    "$SCRIPT_DIR/bun-vs-node-engines" \
    "$LAUNCHPAD_BIN install --verbose --dry-run | grep -q 'bun.sh' && ! $LAUNCHPAD_BIN install --verbose --dry-run | grep -q 'nodejs.org'"

# Summary
echo ""
echo "============================================="
echo -e "${BLUE}📊 Test Summary${NC}"
echo "============================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Bun package manager support is working correctly.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}💥 Some tests failed. Please check the output above.${NC}"
    exit 1
fi
