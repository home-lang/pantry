# Custom Shims

Beyond the basic shim creation functionality, Launchpad allows for advanced shim customization for more complex scenarios.

## Manual Shim Creation

If you need more control over your shims than the standard `launchpad shim` command provides, you can create them manually:

```bash
# Create a directory for your shims if it doesn't exist
mkdir -p ~/.local/bin

# Create a custom shim file
cat > ~/.local/bin/custom-node << EOF
#!/bin/sh
exec pkgx -q node@22.14.2 --max-old-space-size=4096 "$@"
EOF

# Make it executable
chmod +x ~/.local/bin/custom-node
```

## Shim Templates

Launchpad's shims generally follow this template:

```sh
#!/usr/bin/env -S pkgx -q! [package]@[version]
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

## Package-specific Shims

Sometimes, you might want to create a shim for a specific command within a package:

```bash
#!/bin/sh
# Use TypeScript compiler from a specific version of TypeScript
exec pkgx -q typescript@4.6.3 tsc "$@"
```

## Version Locking

Lock a shim to a specific package version:

```bash
#!/bin/sh
# Ensure we always use Node.js 16 for this shim
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

## Compound Commands

Create shims that run multiple commands in sequence:

```bash
#!/bin/sh
# Run ESLint then Prettier
pkgx -q eslint "$@" && pkgx -q prettier --write "$@"
```

## Platform-specific Shims

Create shims that behave differently based on the platform:

```bash
#!/bin/sh
# Platform-specific behavior
if [ "$(uname)" = "Darwin" ]; then
  # macOS-specific options
  exec pkgx -q python@3.10 -m venv "$@"
else
  # Linux/other options
  exec pkgx -q python@3.9 -m venv "$@"
fi
```

## Dev-aware Shims

Create shims that integrate with the `dev` package:

```bash
#!/bin/sh
# If we're in a dev environment, use the project's version
if [ -n "$DEV_PROJECT" ]; then
  exec pkgx -q "$@"
else
  # Otherwise use a specific version
  exec pkgx -q node@22 "$@"
fi
```

## Debugging Shims

Create a debug version of a shim:

```bash
#!/bin/sh
# Print debug info
echo "Arguments: $@" >&2
echo "Working directory: $(pwd)" >&2
echo "PATH: $PATH" >&2

# Run with verbose output
exec pkgx -v -q node "$@"
```

## Managing Custom Shims

Keep track of custom shims by storing them in a Git repository:

```bash
# Create a repository for your custom shims
mkdir ~/my-shims
cd ~/my-shims
git init

# Create your shims here
# ...

# Add them to git
git add .
git commit -m "Add custom shims"

# Symlink them to your PATH
ln -sf ~/my-shims/* ~/.local/bin/
```

This approach allows you to version control your custom shims and easily deploy them to new machines.
