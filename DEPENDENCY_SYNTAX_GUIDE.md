# Dependency Syntax Guide

This guide explains all the ways you can define dependencies in pantry, from simple npm-style syntax to advanced explicit configurations.

## Quick Reference

```jsonc
{
  "dependencies": {
    // ✅ Simple npm-style (auto-detected)
    "owner/repo": "^1.0.0",              // GitHub
    "nodejs.org": "20.11.0",             // pkgx
    "@types/node": "^20.0.0",            // npm (scoped)
    "typescript": "^5.0.0",              // auto (pkgx→npm→github)
    "https://cdn.com/lib.tar.gz": "1.0", // HTTP

    // ✅ Explicit source (full control)
    "my-package": {
      "source": "github",
      "repo": "owner/repo",
      "version": "1.0.0"
    }
  }
}
```

---

## Table of Contents

1. [Simplified Syntax (npm-style)](#simplified-syntax-npm-style)
2. [Explicit Source Syntax](#explicit-source-syntax)
3. [Source Auto-Detection](#source-auto-detection)
4. [Version Specifications](#version-specifications)
5. [Source Resolution Order](#source-resolution-order)
6. [Mixing Syntaxes](#mixing-syntaxes)
7. [Best Practices](#best-practices)

---

## Simplified Syntax (npm-style)

The simplified syntax mirrors npm's `package.json` format. The source is automatically detected from the package name.

### GitHub Packages

**Format:** `owner/repository`

```jsonc
{
  "dependencies": {
    "stacksjs/bunpress": "latest",
    "oven-sh/bun": "^1.0.0",
    "ziglang/zig": "0.13.0"
  }
}
```

**Auto-detection rules:**
- Contains `/` (slash)
- Does NOT start with `@` (not a scoped npm package)
- Maps to `source: "github"`

### pkgx Ecosystem

**Format:** `domain.tld`

```jsonc
{
  "dependencies": {
    "nodejs.org": "20.11.0",
    "python.org": "3.12.0",
    "postgresql.org": "16.1.0",
    "bun.sh": "^1.0.0"
  }
}
```

**Auto-detection rules:**
- Contains `.` (dot)
- Ends with common TLDs: `.org`, `.com`, `.dev`, `.io`, `.sh`, `.net`
- Maps to `source: "pkgx"`

### npm Packages

**Scoped packages format:** `@org/package`

```jsonc
{
  "dependencies": {
    "@types/node": "^20.0.0",
    "@angular/core": "^17.0.0",
    "@vue/compiler-sfc": "^3.4.0"
  }
}
```

**Auto-detection rules:**
- Starts with `@`
- Contains `/` (slash)
- Maps to `source: "npm"`

**Simple package names** (ambiguous):

```jsonc
{
  "dependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "webpack": "^5.0.0"
  }
}
```

**Auto-detection behavior:**
- No specific pattern detected
- Falls back to resolution order: pkgx → npm → github
- Maps to `source: "auto"`

### HTTP Downloads

**Format:** `http://` or `https://` URL

```jsonc
{
  "dependencies": {
    "https://cdn.example.com/lib-v1.0.0.tar.gz": "1.0.0",
    "https://releases.mycompany.com/internal-lib.tar.xz": "2.5.0"
  }
}
```

**Auto-detection rules:**
- Starts with `http://` or `https://`
- Maps to `source: "http"`

### Git Repositories

**Format:** URL ending with `.git`

```jsonc
{
  "dependencies": {
    "https://github.com/user/private-repo.git": "main",
    "git@github.com:company/internal.git": "v2.0.0"
  }
}
```

**Auto-detection rules:**
- Ends with `.git`
- Maps to `source: "git"`

---

## Explicit Source Syntax

For maximum control and advanced options, use the explicit object syntax.

### GitHub (Explicit)

```jsonc
{
  "dependencies": {
    "bunpress": {
      "source": "github",
      "repo": "stacksjs/bunpress",      // Required: owner/repo
      "version": "latest",               // Version or semver range
      "tag": "v0.1.0"                   // Optional: specific release tag
    }
  }
}
```

**Available options:**
- `source`: `"github"` (required)
- `repo`: Owner/repository format (required)
- `version`: Version or range (default: `"latest"`)
- `tag`: Specific release tag (optional)
- `global`: Install globally (optional, default: `false`)

### npm (Explicit)

```jsonc
{
  "dependencies": {
    "typescript": {
      "source": "npm",
      "version": "^5.0.0",
      "registry": "https://registry.npmjs.org"  // Optional: custom registry
    }
  }
}
```

**Available options:**
- `source`: `"npm"` (required)
- `version`: Version or range (required)
- `registry`: Custom npm registry URL (optional)
- `global`: Install globally (optional)

### HTTP (Explicit)

```jsonc
{
  "dependencies": {
    "custom-lib": {
      "source": "http",
      "url": "https://cdn.example.com/lib-v1.0.0.tar.gz",
      "version": "1.0.0"
    }
  }
}
```

**Available options:**
- `source`: `"http"` (required)
- `url`: Direct download URL (required)
- `version`: Version identifier (required)
- `global`: Install globally (optional)

**Supported formats:**
- `.tar.gz`
- `.tar.xz`
- `.zip`

### Git (Explicit)

```jsonc
{
  "dependencies": {
    "git-package": {
      "source": "git",
      "url": "https://github.com/user/repo.git",
      "branch": "main",          // Branch name
      "version": "1.0.0"
    }
  }
}
```

**Alternative with tag:**

```jsonc
{
  "dependencies": {
    "git-package": {
      "source": "git",
      "url": "https://github.com/user/repo.git",
      "tag": "v1.0.0",          // Tag instead of branch
      "version": "1.0.0"
    }
  }
}
```

**Available options:**
- `source`: `"git"` (required)
- `url`: Git repository URL (required)
- `branch`: Branch name (optional, conflicts with `tag`)
- `tag`: Tag name (optional, conflicts with `branch`)
- `version`: Version identifier (required)
- `global`: Install globally (optional)

### pkgx (Explicit)

```jsonc
{
  "dependencies": {
    "node": {
      "source": "pkgx",
      "version": "20.11.0"
    }
  }
}
```

**Available options:**
- `source`: `"pkgx"` (required)
- `version`: Exact version (required)
- `global`: Install globally (optional)

---

## Source Auto-Detection

When using simplified syntax, pantry automatically detects the source based on these patterns:

| Pattern | Example | Detected Source |
|---------|---------|----------------|
| `owner/repo` | `stacksjs/bunpress` | `github` |
| `domain.tld` | `nodejs.org` | `pkgx` |
| `@org/package` | `@types/node` | `npm` |
| `http(s)://...` | `https://cdn.com/lib.tar.gz` | `http` |
| `*.git` | `https://github.com/user/repo.git` | `git` |
| Simple name | `typescript` | `auto` (fallback) |

### Auto-Resolution Fallback

For ambiguous package names (simple names like `typescript`), pantry uses this resolution order:

1. **Check pkgx ecosystem** - Look for package in pkgx registry
2. **Check npm** - Query npm registry if not found in pkgx
3. **Check GitHub** - Search GitHub for `username/typescript` repos (last resort)

**Example flow for `"typescript": "^5.0.0"`:**

```
1. Search pkgx: typescript → Not found
2. Search npm: typescript → Found! ✓
3. Use source: npm
```

---

## Version Specifications

Pantry supports npm-style semantic versioning for all package sources.

### Exact Version

```jsonc
{
  "dependencies": {
    "nodejs.org": "20.11.0"
  }
}
```

### Caret Range (^)

Compatible with version (allows patch and minor updates):

```jsonc
{
  "dependencies": {
    "typescript": "^5.0.0"  // Matches 5.x.x (5.0.0 - 5.99.99)
  }
}
```

### Tilde Range (~)

Approximately equivalent (allows patch updates only):

```jsonc
{
  "dependencies": {
    "bun.sh": "~1.0.0"  // Matches 1.0.x (1.0.0 - 1.0.99)
  }
}
```

### Comparison Operators

```jsonc
{
  "dependencies": {
    "python.org": ">=3.10.0",
    "nodejs.org": ">18.0.0",
    "go.dev": "<=1.21.0"
  }
}
```

### Latest

Always fetch the most recent version:

```jsonc
{
  "dependencies": {
    "stacksjs/bunpress": "latest"
  }
}
```

---

## Source Resolution Order

You can customize how pantry resolves ambiguous package names in your `package.jsonc`:

```jsonc
{
  "sourceResolution": {
    // Default order
    "order": ["pkgx", "npm", "github"],

    // Override for specific packages or patterns
    "preferences": {
      "typescript": "npm",       // Always use npm for typescript
      "*.org": "pkgx",          // All .org domains from pkgx
      "*/*": "github",          // All owner/repo from GitHub
      "@*/*": "npm"             // All scoped packages from npm
    }
  }
}
```

### Custom Resolution Order

Change the default order to prefer npm first:

```jsonc
{
  "sourceResolution": {
    "order": ["npm", "pkgx", "github"]
  }
}
```

Now `"typescript": "^5.0.0"` will check npm first, then pkgx, then GitHub.

---

## Mixing Syntaxes

You can mix simplified and explicit syntax in the same configuration:

```jsonc
{
  "dependencies": {
    // Simplified syntax
    "stacksjs/bunpress": "latest",
    "nodejs.org": "20.11.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",

    // Explicit syntax
    "custom-package": {
      "source": "github",
      "repo": "company/internal",
      "version": "1.0.0",
      "tag": "v1.0.0"
    },

    // HTTP download
    "proprietary-lib": {
      "source": "http",
      "url": "https://cdn.company.com/lib-v2.0.0.tar.gz",
      "version": "2.0.0"
    }
  }
}
```

**Why mix?**
- Use simplified syntax for common public packages
- Use explicit syntax for private packages or custom configurations
- Provides flexibility without sacrificing simplicity

---

## Best Practices

### 1. Prefer Simplified Syntax

```jsonc
// ✅ Good: Simple and readable
{
  "dependencies": {
    "stacksjs/bunpress": "latest",
    "nodejs.org": "20.11.0"
  }
}

// ❌ Unnecessary: Too verbose for simple cases
{
  "dependencies": {
    "bunpress": {
      "source": "github",
      "repo": "stacksjs/bunpress",
      "version": "latest"
    }
  }
}
```

### 2. Use Explicit Syntax When Needed

```jsonc
// ✅ Good: Explicit when you need custom options
{
  "dependencies": {
    "internal-lib": {
      "source": "github",
      "repo": "company/internal",
      "version": "2.0.0",
      "tag": "v2.0.0-beta.1"  // Need specific tag
    }
  }
}
```

### 3. Pin Production Dependencies

```jsonc
// ✅ Good: Exact versions for production
{
  "dependencies": {
    "nodejs.org": "20.11.0",
    "postgresql.org": "16.1.0"
  }
}

// ⚠️ Risky: Ranges in production
{
  "dependencies": {
    "nodejs.org": "^20.0.0"  // Could update unexpectedly
  }
}
```

### 4. Use Ranges for Development

```jsonc
{
  "devDependencies": {
    "typescript": "^5.0.0",  // Ok for dev tools
    "@types/node": "^20.0.0"
  }
}
```

### 5. Organize Dependencies

```jsonc
{
  "dependencies": {
    // Runtime dependencies
    "nodejs.org": "20.11.0",
    "postgresql.org": "16.1.0",

    // Libraries
    "stacksjs/bunpress": "latest",
    "@types/node": "^20.0.0",

    // Custom packages
    "internal-lib": {
      "source": "github",
      "repo": "company/internal",
      "version": "1.0.0"
    }
  }
}
```

### 6. Document Custom Sources

```jsonc
{
  "dependencies": {
    // Internal company library (requires VPN)
    "company-utils": {
      "source": "http",
      "url": "https://internal.company.com/libs/utils-v3.0.0.tar.gz",
      "version": "3.0.0"
    }
  }
}
```

---

## Examples

### Minimal Configuration

```jsonc
{
  "name": "my-app",
  "dependencies": {
    "nodejs.org": "20.11.0"
  }
}
```

### npm-Style Only

```jsonc
{
  "name": "web-app",
  "dependencies": {
    "nodejs.org": "20.11.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
```

### Mixed Sources

```jsonc
{
  "name": "fullstack-app",
  "dependencies": {
    // System dependencies
    "nodejs.org": "20.11.0",
    "postgresql.org": "16.1.0",

    // GitHub packages
    "stacksjs/bunpress": "latest",
    "oven-sh/bun": "^1.0.0",

    // npm packages
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",

    // Custom package
    "company-lib": {
      "source": "http",
      "url": "https://cdn.company.com/lib-v1.0.0.tar.gz",
      "version": "1.0.0"
    }
  }
}
```

### With Custom Resolution

```jsonc
{
  "name": "my-project",
  "dependencies": {
    "typescript": "^5.0.0",  // Will use npm (see sourceResolution)
    "nodejs.org": "20.11.0",
    "stacksjs/bunpress": "latest"
  },
  "sourceResolution": {
    "order": ["npm", "pkgx", "github"],
    "preferences": {
      "typescript": "npm",
      "*.org": "pkgx"
    }
  }
}
```

---

## Summary

| Syntax | Use When | Example |
|--------|----------|---------|
| Simplified | Common public packages | `"owner/repo": "1.0.0"` |
| Explicit | Need custom options | `{ "source": "github", "repo": "..." }` |
| Auto-detection | Quick setup | `"typescript": "^5.0.0"` |
| Custom resolution | Override defaults | `"sourceResolution": { ... }` |

**Key takeaway:** Start with simplified syntax, use explicit syntax only when needed, and leverage auto-detection for flexibility.
