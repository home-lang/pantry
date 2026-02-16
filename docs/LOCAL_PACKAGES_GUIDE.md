# Local Packages & Linking Guide

## Overview

Pantry supports **local package linking** for development workflows, allowing you to work on multiple related packages simultaneously without publishing to registries. This is essential for:

- **Monorepo development** - Work on multiple packages in the same repository
- **Local development** - Test changes before publishing
- **Private packages** - Use packages not published publicly
- **Fast iteration** - No need to publish/install for every change

## Quick Start

### 1. Using Local Paths (Simplified)

The simplest way to use a local package is with a path:

```jsonc
{
  "dependencies": {
    "my-package": "~/Code/my-package",
    "relative-package": "./packages/shared",
    "parent-package": "../sibling-project"
  }
}
```

**Auto-detection:** Pantry automatically detects paths starting with:

- `~/` - Home directory
- `./` - Current directory (relative)
- `../` - Parent directory (relative)
- `/` - Absolute path

### 2. Explicit Local Syntax

For more control, use explicit source specification:

```jsonc
{
  "dependencies": {
    "my-package": {
      "source": "local",
      "path": "~/Code/my-package",
      "version": "local"
    }
  }
}
```

### 3. Link Configuration

Define reusable link mappings:

```jsonc
{
  "link": {
    "zig-config": "~/Code/zig-config",
    "zig-cli": "~/Code/zig-cli",
    "zig-bump": "~/Code/zig-bump"
  },
  "dependencies": {
    "zig-config": "link:zig-config",  // References link mapping
    "zig-cli": "~/Code/zig-cli"       // Or use path directly
  }
}
```

## Path Types

### 1. Home Directory (`~/`)

```jsonc
{
  "dependencies": {
    "zig-config": "~/Code/zig-config"
  }
}
```

**Expands to:** `/Users/username/Code/zig-config` (macOS/Linux) or `C:\Users\username\Code\zig-config` (Windows)

### 2. Relative Path (`./` or `../`)

```jsonc
{
  "dependencies": {
    "shared": "./packages/shared",
    "sibling": "../sibling-project"
  }
}
```

**Resolves relative to:** The directory containing the config file

### 3. Absolute Path (`/`)

```jsonc
{
  "dependencies": {
    "system-lib": "/usr/local/lib/my-lib"
  }
}
```

**Use case:** System libraries or fixed installation locations

## Dual Syntax for Flexibility

One of pantry's key features is **dual local/remote syntax**, allowing packages to work both in development and production:

### Development Configuration

```jsonc
{
  "name": "my-app",
  "dependencies": {
    // Local for development
    "zig-config": "~/Code/zig-config",
    "zig-cli": "~/Code/zig-cli"
  }
}
```

### Production Configuration

```jsonc
{
  "name": "my-app",
  "dependencies": {
    // GitHub for production
    "zig-utils/zig-config": "latest",
    "zig-utils/zig-cli": "latest"
  }
}
```

### Combined (Commented Alternatives)

```jsonc
{
  "name": "my-app",
  "dependencies": {
    // Development: use local paths
    "zig-config": "~/Code/zig-config",
    "zig-cli": "~/Code/zig-cli",

    // Production: uncomment these and comment out locals
    // "zig-utils/zig-config": "latest",
    // "zig-utils/zig-cli": "latest"
  }
}
```

## `pantry link` Command

The `pantry link` command creates symlinks for local development:

### Link a Package

```bash
# In the package directory
cd ~/Code/zig-config
pantry link

# This makes zig-config available globally as a linked package
```

### Use Linked Package

```bash
# In your project
cd ~/Code/my-project

# Reference the linked package
# In pantry.json
{
  "dependencies": {
    "zig-config": "link:zig-config"
  }
}

# Install (uses linked version)
pantry install
```

### Unlink a Package

```bash
cd ~/Code/zig-config
pantry unlink
```

### List Linked Packages

```bash
pantry link:list
# Output
# Linked packages
# zig-config -> ~/Code/zig-config
# zig-cli -> ~/Code/zig-cli
# zig-bump -> ~/Code/zig-bump
```

## Link Registry

Pantry maintains a global link registry at `~/.local/share/pantry/links.json`:

```json
{
  "links": {
    "zig-config": {
      "path": "/Users/user/Code/zig-config",
      "linkedAt": "2024-01-15T10:30:00Z",
      "version": "0.1.0"
    },
    "zig-cli": {
      "path": "/Users/user/Code/zig-cli",
      "linkedAt": "2024-01-15T10:31:00Z",
      "version": "0.2.0"
    }
  }
}
```

## Monorepo Support

For monorepos with multiple packages:

### Project Structure

```
my-monorepo/
├── pantry.json
├── packages/
│   ├── core/
│   │   └── pantry.json
│   ├── cli/
│   │   └── pantry.json
│   └── utils/
│       └── pantry.json
```

### Root `pantry.json`

```jsonc
{
  "name": "my-monorepo",
  "workspaces": [
    "packages/core",
    "packages/cli",
    "packages/utils"
  ]
}
```

### Package Dependencies

In `packages/cli/pantry.json`:

```jsonc
{
  "name": "cli",
  "dependencies": {
    // Reference sibling package
    "core": "../core",
    "utils": "../utils",

    // External dependencies
    "zig-utils/zig-config": "latest"
  }
}
```

## Version Resolution

### Local Packages

Local packages use `"local"` as the version:

```jsonc
{
  "dependencies": {
    "my-package": {
      "source": "local",
      "path": "~/Code/my-package",
      "version": "local"
    }
  }
}
```

In lockfile:

```json
{
  "packages": {
    "my-package@local": {
      "name": "my-package",
      "version": "local",
      "source": "local",
      "resolved": "/Users/user/Code/my-package",
      "integrity": null
    }
  }
}
```

### Linked Packages

Linked packages reference the link registry:

```jsonc
{
  "dependencies": {
    "zig-config": "link:zig-config"
  }
}
```

In lockfile:

```json
{
  "packages": {
    "zig-config@link": {
      "name": "zig-config",
      "version": "link",
      "source": "local",
      "resolved": "/Users/user/Code/zig-config",
      "integrity": null
    }
  }
}
```

## Examples

### Example 1: Simple Local Development

```jsonc
{
  "name": "my-app",
  "dependencies": {
    "zig-config": "~/Code/zig-config"
  }
}
```

```bash
pantry install
# Uses local package at ~/Code/zig-config
```

### Example 2: Multiple Local Packages

```jsonc
{
  "name": "my-app",
  "dependencies": {
    "zig-config": "~/Code/zig-config",
    "zig-cli": "~/Code/zig-cli",
    "zig-bump": "~/Code/zig-bump"
  }
}
```

### Example 3: Mixed Local and Remote

```jsonc
{
  "name": "my-app",
  "dependencies": {
    // Local development package
    "my-lib": "~/Code/my-lib",

    // Remote production packages
    "zig-utils/zig-config": "latest",
    "nodejs.org": "20.11.0"
  }
}
```

### Example 4: Using Link Registry

**Step 1: Link packages**

```bash
cd ~/Code/zig-config && pantry link
cd ~/Code/zig-cli && pantry link
cd ~/Code/zig-bump && pantry link
```

**Step 2: Use in project**

```jsonc
{
  "name": "my-app",
  "dependencies": {
    "zig-config": "link:zig-config",
    "zig-cli": "link:zig-cli",
    "zig-bump": "link:zig-bump"
  }
}
```

### Example 5: Pantry's Own Configuration

The pantry repository itself uses local packages:

```jsonc
{
  "name": "pantry",
  "dependencies": {
    // Development: local paths
    "zig-config": "~/Code/zig-config",
    "zig-cli": "~/Code/zig-cli",
    "zig-bump": "~/Code/zig-bump",

    // System dependency
    "ziglang.org": "0.15.1"
  },
  "link": {
    "zig-config": "~/Code/zig-config",
    "zig-cli": "~/Code/zig-cli",
    "zig-bump": "~/Code/zig-bump"
  }
}
```

**For CI/Production:** Switch to GitHub sources:

```jsonc
{
  "dependencies": {
    "zig-utils/zig-config": "latest",
    "zig-utils/zig-cli": "latest",
    "zig-utils/zig-bump": "latest"
  }
}
```

## Best Practices

### 1. Use Relative Paths for Monorepos

```jsonc
// ✅ Good: Portable across machines
{
  "dependencies": {
    "shared": "../shared"
  }
}

// ❌ Bad: Machine-specific
{
  "dependencies": {
    "shared": "~/Code/monorepo/packages/shared"
  }
}
```

### 2. Document Local Dependencies

```jsonc
{
  "dependencies": {
    // Local development version (requires zig-config cloned locally)
    // Production: use "zig-utils/zig-config": "latest"
    "zig-config": "~/Code/zig-config"
  }
}
```

### 3. Use Link Registry for Reusable Packages

```bash
# Link once
pantry link

# Use everywhere
# Just reference "link:package-name" in any project
```

### 4. Maintain Dual Configurations

Keep both local and remote configurations documented:

```jsonc
{
  "dependencies": {
    // DEVELOPMENT (local)
    "my-lib": "~/Code/my-lib",

    // PRODUCTION (GitHub) - uncomment for deployment
    // "owner/my-lib": "^1.0.0",
  }
}
```

### 5. Use .pantryignore for Local Packages

In local packages, create `.pantryignore`:

```
node_modules/
.git/
zig-cache/
zig-out/
.DS_Store
```

## Troubleshooting

### Issue: Local package not found

**Error:** `Local package not found: ~/Code/zig-config`

**Solution:** Verify the path exists:

```bash
ls ~/Code/zig-config
# Or use absolute path
ls /Users/username/Code/zig-config
```

### Issue: Symlink broken after moving

**Error:** `Linked package not found: zig-config`

**Solution:** Relink the package:

```bash
cd ~/Code/zig-config
pantry unlink
pantry link
```

### Issue: Version mismatch

**Error:** `Local package version mismatch`

**Solution:** Local packages always use version `"local"`. Update your lockfile:

```bash
pantry install --force
```

### Issue: Changes not reflected

**Problem:** Changes to local package aren't visible in dependent project

**Solution:** Local packages are symlinked. If using copies instead:

```bash
# Force reinstall to update
pantry install --force
```

## CI/CD Integration

### Development Build (Local)

```bash
# Use local dependencies
pantry install

# Run tests
pantry test
```

### Production Build (Remote)

```bash
# Switch to GitHub dependencies
# Update pantry.json to use GitHub sources
sed -i 's|"zig-config": "~/Code/zig-config"|"zig-utils/zig-config": "latest"|g' pantry.json

# Install from remote
pantry install --frozen-lockfile

# Build
pantry build
```

### Docker

```dockerfile
# Development
FROM zig:0.15.1
WORKDIR /app
COPY . .
# Use local paths (volumes mounted)
RUN pantry install

# Production
FROM zig:0.15.1
WORKDIR /app
COPY pantry.json .freezer ./
# Use GitHub sources
RUN pantry install --frozen-lockfile
COPY . .
RUN pantry build
```

## Comparison with Other Tools

| Feature | npm link | yarn link | pantry link |
|---------|----------|-----------|-------------|
| Path syntax | ❌ | ❌ | ✅ `~/Code/pkg` |
| Link registry | ✅ | ✅ | ✅ |
| Auto-detect paths | ❌ | ❌ | ✅ |
| Monorepo support | ✅ | ✅ | ✅ |
| Dual local/remote | ❌ | ❌ | ✅ |

## Summary

Local package support in pantry provides:

✅ **Flexible path syntax** - `~/`, `./`, `../`, `/`
✅ **Auto-detection** - Paths detected automatically
✅ **Link registry** - Global package linking
✅ **Dual syntax** - Easy switch between local/remote
✅ **Monorepo ready** - Workspace support
✅ **Type safe** - All Zig compile-time checks
✅ **Well documented** - Clear examples and guides

Use local packages for development, switch to remote for production!
