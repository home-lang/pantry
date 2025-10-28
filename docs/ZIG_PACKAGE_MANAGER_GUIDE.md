# Using Pantry as a Package Manager for Zig Projects

Pantry now supports multi-source package management for Zig projects, allowing you to use dependencies from GitHub, npm, HTTP sources, and the pkgx ecosystem. This guide shows you how to configure and use pantry with your Zig projects.

## Table of Contents

- [Quick Start](#quick-start)
- [Package Configuration](#package-configuration)
- [Package Sources](#package-sources)
- [Lockfile](#lockfile)
- [Distributing Zig Packages](#distributing-zig-packages)
- [Examples](#examples)

## Quick Start

### 1. Create a package.jsonc file

In your Zig project root, create a `package.jsonc` (or `zig.json`) file:

```jsonc
{
  "name": "my-zig-project",
  "version": "0.1.0",
  "dependencies": {
    "my-lib": {
      "source": "github",
      "repo": "user/my-lib",
      "version": "latest"
    }
  }
}
```

### 2. Install dependencies

```bash
# Navigate to your Zig project directory
cd ~/Code/my-zig-project

# Install dependencies (will auto-detect package.jsonc)
pantry install

# Or specify the config file explicitly
pantry install --config package.jsonc
```

### 3. Lockfile generation

Pantry automatically generates a `package-lock.json` file that pins exact versions and checksums:

```json
{
  "version": "0.1.0",
  "lockfileVersion": 1,
  "generatedAt": "1729987654",
  "packages": {
    "my-lib@1.0.0": {
      "name": "my-lib",
      "version": "1.0.0",
      "source": "github",
      "resolved": "https://github.com/user/my-lib/archive/v1.0.0.tar.gz",
      "integrity": "sha256-abc123..."
    }
  }
}
```

## Package Configuration

### Supported Configuration Files

Pantry automatically detects these configuration files (in priority order):

1. `package.jsonc` - JSONC format with comments support (recommended for Zig)
2. `zig.json` - Alternative JSON format
3. `deps.yaml` - YAML format (pkgx-style)
4. `package.json` - Standard npm package.json

### Configuration Format

```jsonc
{
  // Project metadata
  "name": "project-name",
  "version": "0.1.0",
  "description": "Project description",

  // Dependencies
  "dependencies": {
    "package-name": {
      "source": "github|npm|http|git|pkgx",
      "version": "1.0.0",
      // Source-specific fields...
    }
  },

  // Optional: Development dependencies
  "devDependencies": {
    // Similar to dependencies
  },

  // Optional: Build configuration
  "build": {
    "entry": "src/main.zig",
    "output": "zig-out"
  }
}
```

## Package Sources

### 1. GitHub Releases/Repositories

```jsonc
{
  "dependencies": {
    "bunpress": {
      "source": "github",
      "repo": "stacksjs/bunpress",  // owner/repo format
      "version": "latest",           // or specific version
      "tag": "v0.1.0"               // Optional: specific release tag
    }
  }
}
```

**How it works:**

- Resolves to GitHub releases or repository archives
- Can specify `tag` for specific release
- `version: "latest"` always fetches the most recent release

### 2. npm Registry

```jsonc
{
  "dependencies": {
    "typescript-lib": {
      "source": "npm",
      "version": "^5.0.0",          // Supports semver ranges
      "registry": "https://registry.npmjs.org"  // Optional: custom registry
    }
  }
}
```

**Supported version ranges:**

- `^1.0.0` - Compatible with 1.x.x
- `~1.0.0` - Compatible with 1.0.x
- `>=1.0.0` - Greater than or equal
- `1.0.0` - Exact version

### 3. Direct HTTP/HTTPS Downloads

```jsonc
{
  "dependencies": {
    "custom-library": {
      "source": "http",
      "url": "https://example.com/library-v1.0.0.tar.gz",
      "version": "1.0.0"
    }
  }
}
```

**Supported archive formats:**

- `.tar.gz`
- `.tar.xz`
- `.zip`

### 4. Git Repositories

```jsonc
{
  "dependencies": {
    "git-package": {
      "source": "git",
      "url": "https://github.com/user/repo.git",
      "branch": "main",             // Or use "tag": "v1.0.0"
      "version": "1.0.0"
    }
  }
}
```

### 5. pkgx Ecosystem (Default)

```jsonc
{
  "dependencies": {
    "node": {
      "version": "20.11.0"
      // No source specified = pkgx ecosystem
    },
    // Or shorthand:
    "python": "3.12.0"
  }
}
```

## Lockfile

### Purpose

The `package-lock.json` file ensures reproducible builds by:

- Pinning exact versions of all dependencies
- Storing resolved download URLs
- Including integrity checksums (SHA-256)
- Tracking dependency trees

### Format

```json
{
  "version": "0.1.0",
  "lockfileVersion": 1,
  "generatedAt": "1729987654",
  "packages": {
    "package-name@version": {
      "name": "package-name",
      "version": "1.0.0",
      "source": "github",
      "url": "https://github.com/user/repo",
      "resolved": "https://github.com/user/repo/archive/v1.0.0.tar.gz",
      "integrity": "sha256-checksum",
      "dependencies": {
        "sub-dependency": "^2.0.0"
      }
    }
  }
}
```

### Lockfile Commands

```bash
# Generate/update lockfile
pantry install

# Install from lockfile (exact versions)
pantry install --frozen-lockfile

# Update all dependencies
pantry update

# Update specific dependency
pantry update package-name
```

## Distributing Zig Packages

### Option 1: GitHub Releases (Recommended)

**Setup:**

1. Create GitHub releases with semantic versioning:

   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

2. Users reference your package:

   ```jsonc
   {
     "dependencies": {
       "your-zig-lib": {
         "source": "github",
         "repo": "yourorg/your-zig-lib",
         "version": "0.1.0"
       }
     }
   }
   ```

**Benefits:**

- Free hosting on GitHub
- Automatic CDN distribution
- Built-in version management
- Release notes and changelogs

### Option 2: npm Registry

**Setup:**

1. Publish to npm:

   ```bash
   npm publish
   ```

2. Users reference your package:

   ```jsonc
   {
     "dependencies": {
       "your-zig-lib": {
         "source": "npm",
         "version": "^0.1.0"
       }
     }
   }
   ```

### Option 3: Custom HTTP Hosting

**Setup:**

1. Host archives on your server/CDN:

   ```
   https://cdn.example.com/packages/my-lib-v1.0.0.tar.gz
   ```

2. Users reference your package:

   ```jsonc
   {
     "dependencies": {
       "your-lib": {
         "source": "http",
         "url": "https://cdn.example.com/packages/my-lib-v1.0.0.tar.gz",
         "version": "1.0.0"
       }
     }
   }
   ```

### Distributing zig-utils Repos

For the zig-utils organization packages:

**Recommended Structure:**

```
zig-utils/
├── zig-config/          # Configuration management
│   ├── package.jsonc    # Package manifest
│   ├── build.zig        # Build script
│   └── src/
│       └── ...
├── zig-http/            # HTTP client library
│   ├── package.jsonc
│   └── src/
├── zig-json/            # JSON parsing
│   ├── package.jsonc
│   └── src/
└── ...
```

**Each package.jsonc:**

```jsonc
{
  "name": "@zig-utils/config",
  "version": "0.1.0",
  "description": "Configuration management for Zig",

  "dependencies": {
    // Other zig-utils packages as dependencies
    "@zig-utils/json": {
      "source": "github",
      "repo": "zig-utils/zig-json",
      "version": "^0.1.0"
    }
  },

  "repository": {
    "type": "git",
    "url": "https://github.com/zig-utils/zig-config"
  },

  "build": {
    "entry": "src/config.zig"
  }
}
```

**Users install zig-utils packages:**

```jsonc
{
  "dependencies": {
    "@zig-utils/config": {
      "source": "github",
      "repo": "zig-utils/zig-config",
      "version": "latest"
    },
    "@zig-utils/http": {
      "source": "github",
      "repo": "zig-utils/zig-http",
      "version": "^0.2.0"
    }
  }
}
```

## Examples

### Example 1: Simple Zig Project with GitHub Dependencies

```jsonc
{
  "name": "my-app",
  "version": "1.0.0",

  "dependencies": {
    "zig-config": {
      "source": "github",
      "repo": "zig-utils/zig-config",
      "version": "latest"
    },
    "known-folders": {
      "source": "github",
      "repo": "ziglibs/known-folders",
      "version": "^1.0.0"
    }
  }
}
```

### Example 2: Mixed Sources

```jsonc
{
  "name": "fullstack-zig-app",
  "version": "2.0.0",

  "dependencies": {
    // Zig library from GitHub
    "zig-http": {
      "source": "github",
      "repo": "zig-utils/zig-http",
      "version": "0.3.0"
    },

    // npm package for tooling
    "typescript": {
      "source": "npm",
      "version": "^5.0.0"
    },

    // System dependency from pkgx
    "postgresql": {
      "version": "16.1.0"
    },

    // Custom hosted library
    "proprietary-lib": {
      "source": "http",
      "url": "https://cdn.company.com/libs/prop-lib-v2.tar.gz",
      "version": "2.0.0"
    }
  }
}
```

### Example 3: Complete zig-config Setup

```jsonc
{
  "name": "zig-config",
  "version": "0.1.0",
  "description": "Comprehensive configuration management library for Zig",

  "dependencies": {
    "bunpress": {
      "source": "github",
      "repo": "stacksjs/bunpress",
      "version": "latest"
    }
  },

  "devDependencies": {
    "zig": {
      "version": "0.15.1"
    }
  },

  "build": {
    "entry": "src/zig-config.zig",
    "output": "zig-out"
  },

  "repository": {
    "type": "git",
    "url": "https://github.com/your-user/zig-config"
  }
}
```

## Installation Workflow

1. **Dependency Detection:**

   ```bash
   pantry install
   ```

   - Searches for `package.jsonc`, `zig.json`, `deps.yaml`, or `package.json`
   - Parses dependencies with source information

2. **Package Resolution:**
   - For each dependency, resolves based on source type:
     - `github`: Fetches latest release or tag
     - `npm`: Queries npm registry for matching version
     - `http`: Uses provided URL
     - `git`: Clones repository at specified branch/tag
     - `pkgx`: Resolves through pkgx ecosystem

3. **Download & Cache:**
   - Downloads packages to `~/.cache/pantry/packages/`
   - Verifies integrity with SHA-256 checksums
   - Extracts to installation directory

4. **Lockfile Generation:**
   - Creates/updates `package-lock.json`
   - Records exact versions and resolved URLs
   - Stores integrity checksums

5. **Installation:**
   - Installs packages to project or global location
   - Creates symlinks for binaries
   - Sets up environment variables

## Advanced Usage

### Custom Install Location

```bash
# Install to specific directory
pantry install --install-path ./vendor

# Install globally
pantry install --global
```

### Dependency Tree

```bash
# View dependency tree
pantry list --tree

# View installed packages
pantry list
```

### Cache Management

```bash
# View cache stats
pantry cache:stats

# Clear cache
pantry cache:clear

# Clear specific package from cache
pantry cache:clear package-name
```

## Troubleshooting

### Issue: Package not found

**Solution:** Verify source and package name:

```jsonc
{
  "dependencies": {
    "package-name": {
      "source": "github",
      "repo": "owner/repo",  // Correct format: owner/repository
      "version": "latest"
    }
  }
}
```

### Issue: Version mismatch

**Solution:** Check available versions:

```bash
# For GitHub packages
curl https://api.github.com/repos/owner/repo/releases

# For npm packages
npm view package-name versions
```

### Issue: Integrity check failed

**Solution:** Clear cache and reinstall:

```bash
pantry cache:clear package-name
pantry install package-name
```

## Future Enhancements

- [ ] Dependency version resolution algorithms
- [ ] Parallel downloads for faster installation
- [ ] Workspace support for monorepos
- [ ] Private registry authentication
- [ ] Binary caching for compiled packages
- [ ] Automatic dependency updates with `pantry update`

## Contributing

To contribute to pantry's Zig package management:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## Resources

- [Pantry Documentation](../README.md)
- [Zig Build System](https://ziglang.org/learn/build-system/)
- [pkgx Ecosystem](https://pkgx.dev)
- [Semantic Versioning](https://semver.org)

## License

MIT - See [LICENSE](../LICENSE)
