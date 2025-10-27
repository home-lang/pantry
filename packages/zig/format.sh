#!/bin/bash
# Format all Zig code in the project

set -e

echo "Formatting Zig code..."

# Format source files
zig fmt src/

# Format test files
zig fmt test/

# Format benchmark files
zig fmt bench/

# Format build script
zig fmt build.zig

echo "✓ All Zig code formatted successfully!"
