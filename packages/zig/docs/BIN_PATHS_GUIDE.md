# Bin Paths Guide

## Overview

Pantry supports defining custom bin paths for packages through the `bin` field in `pantry.json` or `package.json`. When packages are installed, executables are automatically symlinked to `pantry/.bin/` and added to your PATH through shell integration.

## Features

✅ **Custom bin paths** - Define executables anywhere in your package
✅ **Automatic symlinking** - Bins are symlinked to `pantry/.bin/`
✅ **Automatic PATH** - Shell integration adds `.bin` to PATH automatically
✅ **Multiple formats** - Object or string format for bin definitions
✅ **Fallback support** - Falls back to package registry if no bin field

## Configuration

### Object Format (Multiple Executables)

Define multiple executables with custom names:

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "bin": {
    "mytool": "dist/mytool.sh",
    "helper": "scripts/helper.sh",
    "cli": "build/cli"
  }
}
```

This creates symlinks:

- `pantry/.bin/mytool` → `pantry/my-package/v1.0.0/dist/mytool.sh`
- `pantry/.bin/helper` → `pantry/my-package/v1.0.0/scripts/helper.sh`
- `pantry/.bin/cli` → `pantry/my-package/v1.0.0/build/cli`

### String Format (Single Executable)

For packages with a single executable:

```json
{
  "name": "my-tool",
  "version": "1.0.0",
  "bin": "bin/my-tool"
}
```

This creates:

- `pantry/.bin/my-tool` → `pantry/my-tool/v1.0.0/bin/my-tool`

The executable name is derived from the basename of the path.

## How It Works

### 1. Package Installation

When you install a package with `pantry install`:

1. Package is downloaded/copied to `pantry/{package}/v{version}/`
2. Pantry looks for `pantry.json` or `package.json` in the package
3. If a `bin` field exists, custom symlinks are created
4. If no `bin` field, falls back to package registry `programs` field
5. Symlinks are created in `pantry/.bin/`

### 2. Shell Integration

When you navigate to a project directory:

1. Shell hook detects the project
2. Pantry activates the environment
3. `pantry/.bin` is added to PATH
4. All executables become available

### 3. Environment Variables

When activated, these variables are set:

```bash
PANTRY_CURRENT_PROJECT=/path/to/project
PANTRY_ENV_BIN_PATH=/path/to/env/bin
PANTRY_ENV_DIR=/path/to/env
pantry_BIN_PATH=/path/to/project/pantry/.bin
PATH=/path/to/project/pantry/.bin:/path/to/env/bin:$PATH
```

## Examples

### Example 1: Development Tool

```json
{
  "name": "dev-tools",
  "version": "2.1.0",
  "bin": {
    "build": "scripts/build.sh",
    "test": "scripts/test.sh",
    "deploy": "scripts/deploy.sh"
  }
}
```

Usage:

```bash
cd my-project
pantry install dev-tools
# Executables automatically in PATH
build
test
deploy
```

### Example 2: CLI Application

```json
{
  "name": "mycli",
  "version": "1.0.0",
  "bin": "dist/mycli"
}
```

Usage:

```bash
pantry install mycli
mycli --help
```

### Example 3: Multiple Entry Points

```json
{
  "name": "database-tools",
  "version": "3.0.0",
  "bin": {
    "db": "bin/db",
    "migrate": "bin/migrate",
    "seed": "bin/seed",
    "backup": "bin/backup"
  }
}
```

### Example 4: TypeScript/Node.js Package

```json
{
  "name": "@myorg/cli-tool",
  "version": "1.5.2",
  "bin": {
    "mycli": "dist/index.js"
  }
}
```

Make sure `dist/index.js` has a shebang:

```javascript
# !/usr/bin/env node
console.log('Hello from mycli');
```

### Example 5: Nested Scripts

```json
{
  "name": "workflow-tools",
  "version": "1.0.0",
  "bin": {
    "workflow": "packages/core/bin/workflow",
    "task": "packages/tasks/bin/task",
    "monitor": "tools/monitoring/monitor.sh"
  }
}
```

## Best Practices

### 1. Use Shebangs

All executables should have proper shebangs:

```bash
# !/bin/bash
# or
# !/usr/bin/env node
# or
# !/usr/bin/env python3
```

### 2. Make Files Executable

Ensure your bin files have execute permissions:

```bash
chmod +x dist/mytool.sh
```

### 3. Consistent Naming

Use clear, descriptive names for executables:

```json
{
  "bin": {
    "my-tool": "dist/my-tool",      // Good: kebab-case
    "helper-script": "bin/helper"    // Good: descriptive
  }
}
```

### 4. Relative Paths

Always use relative paths from the package root:

```json
{
  "bin": {
    "tool": "bin/tool",           // ✅ Good: relative
    "bad": "/absolute/path"        // ❌ Bad: absolute path
  }
}
```

### 5. Test Your Bins

Before publishing, test that your executables work:

```bash
# Install locally
pantry install

# Test executables
mytool --version
helper --help
```

## Fallback Behavior

If a package doesn't define a `bin` field, Pantry falls back to:

1. Package registry `programs` field (for known packages)
2. Standard `bin/` directory convention

Example package registry entry:

```zig
.{
    .name = "bun",
    .domain = "bun.sh",
    .programs = &[_][]const u8{"bun"},
    // ...
}
```

## Directory Structure

Typical package structure with bin field:

```
my-package/
├── pantry.json          # Package config with bin field
├── bin/                 # Optional: standard bin directory
│   └── my-tool
├── dist/                # Built executables
│   ├── cli
│   └── helper
├── scripts/             # Utility scripts
│   └── deploy.sh
└── src/                 # Source code
    └── ...
```

After installation:

```
project/
├── pantry/
│   ├── .bin/            # Symlinks to all executables
│   │   ├── my-tool -> ../my-package/v1.0.0/bin/my-tool
│   │   ├── cli -> ../my-package/v1.0.0/dist/cli
│   │   ├── helper -> ../my-package/v1.0.0/dist/helper
│   │   └── deploy -> ../my-package/v1.0.0/scripts/deploy.sh
│   └── my-package/
│       └── v1.0.0/
│           └── ... (package contents)
└── pantry.json
```

## Troubleshooting

### Issue: Executable not found

**Error:** `mytool: command not found`

**Solutions:**

1. Check if package is installed:

   ```bash
   ls pantry/.bin/
   ```

2. Verify bin field in package:

   ```bash
   cat pantry/my-package/v1.0.0/pantry.json
   ```

3. Check if file exists:

   ```bash
   ls -la pantry/my-package/v1.0.0/dist/mytool.sh
   ```

4. Verify executable permissions:

   ```bash
   chmod +x pantry/my-package/v1.0.0/dist/mytool.sh
   ```

5. Reinstall package:

   ```bash
   pantry install --force my-package
   ```

### Issue: Symlink broken

**Error:** `Warning: Bin not found: /path/to/bin`

**Solutions:**

1. Verify the path in bin field matches actual file location
2. Check if file was moved after installation
3. Reinstall package

### Issue: PATH not updated

**Problem:** Executables exist but aren't in PATH

**Solutions:**

1. Ensure shell integration is activated:

   ```bash
   source ~/.bashrc  # or ~/.zshrc
   ```

2. Check environment variables:

   ```bash
   echo $pantry_BIN_PATH
   ```

3. Manually test:

   ```bash
   ./pantry/.bin/mytool
   ```

### Issue: Permission denied

**Error:** `Permission denied: ./pantry/.bin/mytool`

**Solutions:**

1. Make executable:

   ```bash
   chmod +x pantry/.bin/mytool
   ```

2. Check source file permissions:

   ```bash
   ls -la pantry/my-package/v1.0.0/dist/mytool.sh
   ```

## Comparison with npm

| Feature | npm | Pantry |
|---------|-----|---------|
| Bin directory | `node_modules/.bin` | `pantry/.bin` |
| Config field | `bin` | `bin` |
| Object format | ✅ | ✅ |
| String format | ✅ | ✅ |
| Auto PATH | ✅ (via scripts) | ✅ (via shell integration) |
| Symlinking | ✅ | ✅ |
| Cross-platform | ✅ | ✅ |

## Summary

The bin paths feature provides:

✅ **Flexible configuration** - Object or string format
✅ **Automatic setup** - Symlinks created on install
✅ **Shell integration** - PATH updated automatically
✅ **Standard convention** - Works like npm/yarn/.bin
✅ **Fallback support** - Uses registry if no bin field
✅ **Cross-package** - Works with any package type

Use bin paths to make your package executables easily accessible!
