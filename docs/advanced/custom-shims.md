# Custom Shims

Beyond the basic shim creation functionality, Launchpad allows for advanced shim customization for more complex scenarios, performance optimization, and specialized workflows.

## Understanding Shim Architecture

Launchpad shims are lightweight executable scripts that:
- Activate the appropriate environment
- Set necessary environment variables
- Execute the target binary with proper context
- Maintain isolation between different project environments

## Manual Shim Creation

If you need more control over your shims than the standard `launchpad shim` command provides, you can create them manually:

```bash
# Create a directory for your shims if it doesn't exist
mkdir -p ~/.local/bin

# Create a custom shim file
cat > ~/.local/bin/custom-node << EOF
#!/bin/sh
exec pkgx -q node@22.0.0 --max-old-space-size=4096 "\$@"
EOF

# Make it executable
chmod +x ~/.local/bin/custom-node
```

## Shim Templates

Launchpad's shims generally follow this template:

```sh
#!/usr/bin/env -S pkgx -q [package]@[version]
```

For more complex requirements, you might want to use:

```sh
#!/bin/sh
# Custom environment settings
export NODE_OPTIONS="--max-old-space-size=8192"
export DEBUG=true

# Execute the actual command
exec pkgx -q [package]@[version] "$@"
```

## Environment-Aware Shims

Create shims that integrate with Launchpad's environment system:

```bash
#!/bin/sh
# Custom Node.js shim with environment awareness

# Check if we're in a Launchpad environment
if [ -n "$LAUNCHPAD_ENV_HASH" ]; then
  # Use environment-specific binary if available
  ENV_NODE="$HOME/.local/share/launchpad/envs/$LAUNCHPAD_ENV_HASH/bin/node"
  if [ -x "$ENV_NODE" ]; then
    exec "$ENV_NODE" "$@"
  fi
fi

# Fallback to global pkgx
exec pkgx -q node@22 "$@"
```

## Package-specific Shims

Sometimes, you might want to create a shim for a specific command within a package:

```bash
#!/bin/sh
# Use TypeScript compiler from a specific version of TypeScript
exec pkgx -q typescript@5.0.0 tsc "$@"
```

## Version Locking

Lock a shim to a specific package version:

```bash
#!/bin/sh
# Ensure we always use Node.js 22 for this shim
exec pkgx -q node@22 "$@"
```

## Environment Variables

Add environment variables to a shim:

```bash
#!/bin/sh
# Set environment variables
export NODE_ENV=production
export DEBUG=false

# Execute the command
exec pkgx -q node "$@"
```

## Performance-Optimized Shims

Create shims that directly reference installed binaries for better performance:

```bash
#!/bin/sh
# Direct execution shim (faster than pkgx resolution)
# Update path based on your actual installation
DIRECT_PATH="$HOME/.local/pkgs/nodejs.org/v22.0.0/bin/node"

if [ -x "$DIRECT_PATH" ]; then
  exec "$DIRECT_PATH" "$@"
else
  # Fallback to pkgx
  exec pkgx -q node@22 "$@"
fi
```

## Shell Message Integration

Create shims that provide feedback when used:

```bash
#!/bin/sh
# Shim with custom messaging
if [ "$LAUNCHPAD_SHOW_ENV_MESSAGES" = "true" ]; then
  echo "🚀 Using custom Node.js shim" >&2
fi

exec pkgx -q node@22 "$@"
```

## Compound Commands

Create shims that run multiple commands in sequence:

```bash
#!/bin/sh
# Run ESLint then Prettier
echo "🔍 Running ESLint..." >&2
pkgx -q eslint "$@" && {
  echo "✨ Running Prettier..." >&2
  pkgx -q prettier --write "$@"
}
```

## Platform-specific Shims

Create shims that behave differently based on the platform:

```bash
#!/bin/sh
# Platform-specific behavior
case "$(uname)" in
  Darwin)
    # macOS-specific options
    exec pkgx -q python@3.12 -m venv "$@"
    ;;
  Linux)
    # Linux-specific options
    exec pkgx -q python@3.11 -m venv "$@"
    ;;
  CYGWIN*|MINGW*|MSYS*)
    # Windows-specific options
    exec pkgx -q python@3.12 -m venv "$@"
    ;;
  *)
    # Default fallback
    exec pkgx -q python@3.11 -m venv "$@"
    ;;
esac
```

## Project-Aware Shims

Create shims that detect project context:

```bash
#!/bin/sh
# Project-aware Node.js shim

# Check for project-specific Node version
if [ -f package.json ]; then
  # Extract Node version from engines field (requires jq)
  if command -v jq >/dev/null 2>&1; then
    NODE_VERSION=$(jq -r '.engines.node // empty' package.json 2>/dev/null)
    if [ -n "$NODE_VERSION" ]; then
      exec pkgx -q "node@$NODE_VERSION" "$@"
    fi
  fi
fi

# Check for .nvmrc
if [ -f .nvmrc ]; then
  NODE_VERSION=$(cat .nvmrc)
  exec pkgx -q "node@$NODE_VERSION" "$@"
fi

# Default to latest LTS
exec pkgx -q node@22 "$@"
```

## Debugging Shims

Create a debug version of a shim:

```bash
#!/bin/sh
# Debug shim with detailed information
if [ "$LAUNCHPAD_DEBUG_SHIMS" = "true" ]; then
  echo "🐛 Debug Info:" >&2
  echo "  Arguments: $*" >&2
  echo "  Working directory: $(pwd)" >&2
  echo "  PATH: $PATH" >&2
  echo "  Environment hash: $LAUNCHPAD_ENV_HASH" >&2
fi

# Run with verbose output if debugging
if [ "$LAUNCHPAD_DEBUG_SHIMS" = "true" ]; then
  exec pkgx -v -q node "$@"
else
  exec pkgx -q node "$@"
fi
```

## Fallback Shims

Create shims with multiple fallback strategies:

```bash
#!/bin/sh
# Multi-fallback shim

# Try environment-specific binary first
if [ -n "$LAUNCHPAD_ENV_HASH" ]; then
  ENV_BINARY="$HOME/.local/share/launchpad/envs/$LAUNCHPAD_ENV_HASH/bin/node"
  if [ -x "$ENV_BINARY" ]; then
    exec "$ENV_BINARY" "$@"
  fi
fi

# Try system installation
for path in /usr/local/bin/node ~/.local/bin/node; do
  if [ -x "$path" ]; then
    exec "$path" "$@"
  fi
done

# Try pkgx as last resort
if command -v pkgx >/dev/null 2>&1; then
  exec pkgx -q node "$@"
fi

# Final fallback
echo "❌ Node.js not found. Install with: launchpad install node" >&2
exit 1
```

## Managing Custom Shims

### Organized Shim Directory

Keep track of custom shims by storing them in a Git repository:

```bash
# Create a repository for your custom shims
mkdir ~/my-shims
cd ~/my-shims
git init

# Create subdirectories for organization
mkdir -p {development,production,debug,platform-specific}

# Create your shims in appropriate directories
# development/node-dev
# production/node-prod
# debug/node-debug
# platform-specific/node-macos

# Add them to git
git add .
git commit -m "Add custom shims"

# Symlink them to your PATH
find ~/my-shims -type f -executable | while read shim; do
  ln -sf "$shim" ~/.local/bin/
done
```

### Shim Testing

Test your custom shims thoroughly:

```bash
# Test basic functionality
~/my-shims/development/node-dev --version

# Test with different arguments
~/my-shims/development/node-dev -e "console.log('test')"

# Test environment variable handling
LAUNCHPAD_DEBUG_SHIMS=true ~/my-shims/debug/node-debug --version
```

### Shim Documentation

Document your custom shims:

```bash
# Create a README for your shims
cat > ~/my-shims/README.md << EOF
# Custom Launchpad Shims

## Development Shims
- \`node-dev\`: Node.js with development optimizations
- \`python-dev\`: Python with debugging enabled

## Production Shims
- \`node-prod\`: Node.js with production settings
- \`python-prod\`: Python with performance optimizations

## Debug Shims
- \`node-debug\`: Node.js with verbose debugging
- \`python-debug\`: Python with debug information

## Platform-Specific Shims
- \`node-macos\`: macOS-optimized Node.js
- \`python-linux\`: Linux-optimized Python

## Usage
Symlink desired shims to ~/.local/bin/ and ensure it's in your PATH.
EOF
```

### Dynamic Shim Generation

Create a script to generate shims dynamically:

```bash
#!/bin/bash
# generate-shim.sh - Dynamic shim generator

PACKAGE="$1"
VERSION="$2"
TYPE="${3:-standard}"
OUTPUT_DIR="$HOME/.local/bin"

if [ -z "$PACKAGE" ] || [ -z "$VERSION" ]; then
  echo "Usage: $0 <package> <version> [type]"
  echo "Types: standard, debug, performance, environment-aware"
  exit 1
fi

case "$TYPE" in
  debug)
    cat > "$OUTPUT_DIR/$PACKAGE" << EOF
#!/bin/sh
echo "🐛 Debugging $PACKAGE@$VERSION" >&2
exec pkgx -v -q $PACKAGE@$VERSION "\$@"
EOF
    ;;
  performance)
    cat > "$OUTPUT_DIR/$PACKAGE" << EOF
#!/bin/sh
# Performance-optimized shim
DIRECT_PATH="\$HOME/.local/pkgs/$PACKAGE/v$VERSION/bin/$PACKAGE"
if [ -x "\$DIRECT_PATH" ]; then
  exec "\$DIRECT_PATH" "\$@"
else
  exec pkgx -q $PACKAGE@$VERSION "\$@"
fi
EOF
    ;;
  *)
    cat > "$OUTPUT_DIR/$PACKAGE" << EOF
#!/bin/sh
exec pkgx -q $PACKAGE@$VERSION "\$@"
EOF
    ;;
esac

chmod +x "$OUTPUT_DIR/$PACKAGE"
echo "✅ Created $TYPE shim for $PACKAGE@$VERSION at $OUTPUT_DIR/$PACKAGE"
```

This approach allows you to version control your custom shims and easily deploy them to new machines or share them with team members.
