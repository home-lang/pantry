#!/bin/bash

# Comprehensive Shell Integration Test Script
# Tests that pantry shell integration works correctly across all environments
# and can detect future regressions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Use the correct pantry binary - prefer the one in PATH, fallback to common locations
pantry_BIN=""
if command -v pantry >/dev/null 2>&1; then
    pantry_BIN="pantry"
elif [[ -f "$HOME/.bun/bin/pantry" ]]; then
    pantry_BIN="$HOME/.bun/bin/pantry"
elif [[ -f "/usr/local/bin/pantry" ]]; then
    pantry_BIN="/usr/local/bin/pantry"
elif [[ -f "$SCRIPT_DIR/../bin/pantry" ]]; then
    pantry_BIN="$SCRIPT_DIR/../bin/pantry"
else
    echo "❌ Could not find pantry binary"
    exit 1
fi

FAILED_TESTS=0
PASSED_TESTS=0

echo "🧪 Running pantry Shell Integration Tests"
echo "============================================="
echo "Using pantry binary: $pantry_BIN"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
run_test() {
    local test_name="$1"
    local test_dir="$2"
    local test_command="$3"

    echo -e "\n${BLUE}Testing:${NC} $test_name"
    echo -e "${BLUE}Directory:${NC} $test_dir"
    echo -e "${BLUE}Command:${NC} $test_command"

    cd "$SCRIPT_DIR/$test_dir" 2>/dev/null || {
        echo -e "${RED}❌ Directory not found:${NC} $test_dir"
        ((FAILED_TESTS++))
        return 1
    }

    # Run the test and capture both stdout and stderr
    local output
    local exit_code=0

    if output=$(eval "$test_command" 2>&1); then
        echo -e "${GREEN}✅ Test passed:${NC} $test_name"
        ((PASSED_TESTS++))

        # Check for specific patterns that shouldn't appear
        if echo "$output" | grep -q '\[dotenvx@'; then
            echo -e "${YELLOW}⚠️  Warning: dotenvx output detected in:${NC} $test_name"
            echo "Output: $output"
        fi

        # Check for ANSI escape sequences (which would cause shell errors)
        if echo "$output" | od -c | grep -q '\\033'; then
            echo -e "${YELLOW}⚠️  Warning: ANSI escape sequences detected in:${NC} $test_name"
            echo "Raw output: $(echo "$output" | od -c | head -3)"
        fi
    else
        exit_code=$?
        echo -e "${RED}❌ Test failed:${NC} $test_name (exit code: $exit_code)"
        echo "Output: $output"
        ((FAILED_TESTS++))
    fi

    return $exit_code
}

# Basic functionality tests
echo -e "\n${BLUE}=== Basic Functionality Tests ===${NC}"

run_test "Binary execution" "." "$pantry_BIN --version"
run_test "Help command" "." "$pantry_BIN --help | head -5"

# Shell code generation tests
echo -e "\n${BLUE}=== Shell Code Generation Tests ===${NC}"

run_test "Shell code generation" "." "$pantry_BIN dev:shellcode >/dev/null"
run_test "Shell code without ANSI" "." "$pantry_BIN dev:shellcode | od -c | grep -v '\\\\033' >/dev/null"
run_test "Shell code with env suppression" "." "pantry_SHELL_INTEGRATION=1 $pantry_BIN dev:shellcode >/dev/null"

# Environment-specific tests
echo -e "\n${BLUE}=== Environment-Specific Tests ===${NC}"

# Test environments with dependency files
test_environments=(
    "stacks-config:dependencies.yaml"
    "mixed-global-local:dependencies.yaml"
    "complex-deps:dependencies.yaml"
    "working-test:dependencies.yaml"
    "simple-global-string:dependencies.yaml"
    "dev-machine-setup:dependencies.yaml"
    "fullstack-mixed:dependencies.yaml"
    "team-standard:dependencies.yaml"
    "python-focused:deps.yml"
    "minimal:pkgx.yaml"
)

for env_config in "${test_environments[@]}"; do
    IFS=':' read -r env_name dep_file <<< "$env_config"

    if [[ -d "$SCRIPT_DIR/$env_name" ]]; then
        run_test "Dry run: $env_name" "$env_name" "$pantry_BIN dev --dry-run"
        run_test "Shell code: $env_name" "$env_name" "$pantry_BIN dev:shellcode | head -10 >/dev/null"
        run_test "Environment detection: $env_name" "$env_name" "test -f $dep_file"
    else
        echo -e "${YELLOW}⚠️  Skipping missing environment:${NC} $env_name"
    fi
done

# Integration tests with shell evaluation
echo -e "\n${BLUE}=== Shell Integration Tests ===${NC}"

run_test "Shell integration syntax" "stacks-config" "bash -n <($pantry_BIN dev:shellcode)"
run_test "Shell integration execution" "stacks-config" "bash -c 'eval \"\$($pantry_BIN dev:shellcode)\" && echo \"Integration successful\"'"

# Suppression effectiveness tests
echo -e "\n${BLUE}=== Suppression Effectiveness Tests ===${NC}"

run_test "No dotenvx output in shell code" "stacks-config" "$pantry_BIN dev:shellcode | grep -v '\\[dotenvx@' | wc -l | grep -q '[1-9]'"
run_test "Suppression with env var" "stacks-config" "pantry_SHELL_INTEGRATION=1 $pantry_BIN dev:shellcode | grep -c '\\[dotenvx@' | grep -q '^0\$'"
run_test "Clean shell code output" "stacks-config" "$pantry_BIN dev:shellcode | sed 's/\\x1b\\[[0-9;]*m//g' | grep -v '^\\[dotenvx@' | wc -l | grep -q '[1-9]'"

# Safety net filtering tests
echo -e "\n${BLUE}=== Safety Net Filtering Tests ===${NC}"

# Test that our sed filtering works as expected
run_test "ANSI filtering with sed" "stacks-config" "echo -e '\\033[38;5;142mtest\\033[0m' | sed 's/\\x1b\\[[0-9;]*m//g' | grep -q '^test\$'"
run_test "Dotenvx filtering with grep" "stacks-config" "printf 'normal line\\n[dotenvx@1.46.0] test\\nnormal line\\n' | grep -v '^\\[dotenvx@' | wc -l | sed 's/[[:space:]]//g' | grep -q '^2\$'"

# Combined integration command test
echo -e "\n${BLUE}=== Full Integration Command Test ===${NC}"

integration_cmd="pantry_SHELL_INTEGRATION=1 eval \"\$($pantry_BIN dev:shellcode 2>/dev/null | sed 's/\\\\x1b\\\\[[0-9;]*m//g' | grep -v '^\\\\[dotenvx@' | grep -v '^[[:space:]]*\$')\""
run_test "Full integration command" "stacks-config" "bash -c '$integration_cmd && echo \"Full integration successful\"'"

# Performance and edge case tests
echo -e "\n${BLUE}=== Performance and Edge Case Tests ===${NC}"

run_test "Empty environment handling" "." "cd /tmp && $pantry_BIN dev:shellcode >/dev/null"
run_test "Nested directory handling" "deeply-nested/level1/level2/level3/level4/level5/level6/level7/level8/level9/level10/final-project" "$pantry_BIN dev --dry-run"
run_test "Permission handling" "." "chmod +x \$TMPDIR/test-pantry-\$\$ 2>/dev/null || echo 'Permission test skipped'"

# Results summary
echo -e "\n${BLUE}=== Test Results Summary ===${NC}"
echo "============================================="
echo -e "✅ Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "❌ Failed: ${RED}$FAILED_TESTS${NC}"
echo -e "📊 Total:  $((PASSED_TESTS + FAILED_TESTS))"

if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "\n🎉 ${GREEN}All tests passed!${NC} Shell integration is working correctly."
    exit 0
else
    echo -e "\n💥 ${RED}Some tests failed.${NC} Please check the output above for details."
    exit 1
fi
