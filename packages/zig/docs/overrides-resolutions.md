# Overrides and Resolutions

> Control metadependency versions with npm overrides and Yarn resolutions

Pantry supports npm's `"overrides"` and Yarn's `"resolutions"` in `package.json`. These are mechanisms for specifying a version range for **metadependencies**—the dependencies of your dependencies.

## What are Metadependencies?

Metadependencies are dependencies of your dependencies. For example, if your project depends on package `foo`, and `foo` depends on package `bar`, then `bar` is a metadependency of your project.

```
Your Project
  └─ foo (dependency)
      └─ bar (metadependency)
```

## Why Use Overrides?

Overrides and resolutions are useful for several scenarios:

1. **Security Vulnerabilities**: Pin a metadependency to a secure version when a vulnerability is discovered
2. **Bug Fixes**: Force all packages to use a specific version that contains a critical bug fix
3. **Version Consistency**: Ensure all packages use the same version of a shared dependency
4. **Testing**: Test your application with specific versions of metadependencies

## Using Overrides

### npm-style `"overrides"`

Add an `"overrides"` field to your `package.json`:

```json
{
  "name": "my-app",
  "dependencies": {
    "foo": "^2.0.0"
  },
  "overrides": {
    "bar": "~4.4.0",
    "baz": "^1.2.3"
  }
}
```

When you run `pantry install`, Pantry will install the specified versions of `bar` and `baz`, regardless of what versions are requested by your dependencies.

### Yarn-style `"resolutions"`

Pantry also supports Yarn's `"resolutions"` field for compatibility:

```json
{
  "name": "my-app",
  "dependencies": {
    "foo": "^2.0.0"
  },
  "resolutions": {
    "bar": "~4.4.0"
  }
}
```

### Using Both

You can use both `"overrides"` and `"resolutions"` in the same `package.json`. They will be merged together:

```json
{
  "name": "my-app",
  "overrides": {
    "foo": "^1.0.0"
  },
  "resolutions": {
    "bar": "~2.0.0"
  }
}
```

## Version Range Syntax

Overrides support the same version range syntax as dependencies:

| Syntax | Meaning | Example |
|--------|---------|---------|
| Exact version | Use this exact version | `"1.2.3"` |
| Caret range | Compatible with version | `"^1.2.3"` |
| Tilde range | Approximately equivalent | `"~1.2.3"` |
| Greater than | Any version greater than | `">1.2.3"` or `">=1.2.3"` |
| Less than | Any version less than | `"<2.0.0"` or `"<=1.9.9"` |
| Latest | Latest available version | `"latest"` or `"*"` |
| Next | Next pre-release version | `"next"` |
| GitHub | GitHub repository | `"github:owner/repo#ref"` |

## Examples

### Example 1: Fix Security Vulnerability

Suppose you're using `foo@2.0.0`, which depends on `bar@4.5.6`. A security vulnerability is discovered in `bar@4.5.6`, but the fixed version is `bar@4.4.0`.

```json
{
  "name": "my-app",
  "dependencies": {
    "foo": "^2.0.0"
  },
  "overrides": {
    "bar": "4.4.0"
  }
}
```

Now when you install, Pantry will use `bar@4.4.0` instead of `bar@4.5.6`:

```
node_modules
├── foo@2.0.0
└── bar@4.4.0  ← overridden from 4.5.6
```

### Example 2: Ensure Version Consistency

Multiple dependencies might require different versions of the same package. You can force all of them to use the same version:

```json
{
  "name": "my-app",
  "dependencies": {
    "package-a": "^1.0.0",
    "package-b": "^2.0.0"
  },
  "overrides": {
    "lodash": "^4.17.21"
  }
}
```

Both `package-a` and `package-b` will now use the same version of `lodash`, even if they specified different version ranges in their own `package.json` files.

### Example 3: Multiple Overrides

You can override multiple packages at once:

```json
{
  "name": "my-app",
  "dependencies": {
    "react-app": "^1.0.0"
  },
  "overrides": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "~5.0.0"
  }
}
```

### Example 4: Using GitHub Versions

You can override a package to use a specific GitHub commit, branch, or tag:

```json
{
  "name": "my-app",
  "overrides": {
    "my-package": "github:owner/repo#v2.0.0-beta"
  }
}
```

## How Overrides Work

1. **Parse Dependencies**: Pantry reads your `package.json` and identifies all dependencies
2. **Load Overrides**: Pantry loads both `"overrides"` and `"resolutions"` fields
3. **Apply Overrides**: For each dependency, if an override exists, Pantry replaces the version range with the override version
4. **Install**: Pantry installs packages using the overridden versions

### Installation Process

```
┌─────────────────────────────────────┐
│  Read package.json                  │
│  - dependencies: { foo: "^2.0.0" }  │
│  - overrides: { bar: "~4.4.0" }     │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  Resolve foo's dependencies         │
│  - foo@2.0.0 depends on bar@^4.5.0  │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  Apply overrides                    │
│  - bar: ^4.5.0 → ~4.4.0 (override)  │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  Install with overridden versions   │
│  - foo@2.0.0                        │
│  - bar@4.4.0                        │
└─────────────────────────────────────┘
```

## Limitations

### Top-Level Overrides Only

Pantry currently only supports **top-level overrides**. Nested overrides (where you specify different versions for the same package depending on the parent) are not supported.

**Supported (top-level):**
```json
{
  "overrides": {
    "bar": "~4.4.0"
  }
}
```

**Not Supported (nested):**
```json
{
  "overrides": {
    "foo": {
      "bar": "~4.4.0"
    }
  }
}
```

### Global Application

Overrides apply **globally** to all instances of a package in your dependency tree. If you override `bar` to version `~4.4.0`, all packages that depend on `bar` will use that version, regardless of their original version requirements.

## Troubleshooting

### Override Not Taking Effect

If your override isn't working:

1. **Check the package name**: Make sure you're using the exact package name as it appears in the registry
2. **Check the version range**: Ensure the version range is valid and the version exists
3. **Clear cache**: Try clearing your Pantry cache and reinstalling:
   ```bash
   rm -rf pantry_modules
   pantry install
   ```

### Version Conflicts

If you get version conflict errors:

1. **Check compatibility**: Make sure the overridden version is compatible with packages that depend on it
2. **Use ranges instead of exact versions**: Try using `^` or `~` ranges instead of exact versions to allow some flexibility

### Invalid Version Range

If Pantry warns about an invalid version range:

```
Warning: Invalid version range 'invalid-version' for package 'foo', skipping
```

This means the version specification doesn't match any supported format. Check the [Version Range Syntax](#version-range-syntax) section above.

## Best Practices

### 1. Document Why

Always add a comment explaining why you're using an override:

```json
{
  "overrides": {
    // Security fix for CVE-2023-12345
    "vulnerable-package": "1.2.4"
  }
}
```

### 2. Use Ranges When Possible

Prefer version ranges over exact versions to allow for patch updates:

```json
{
  "overrides": {
    "foo": "~1.2.0"  // Good: allows 1.2.x patches
    // vs
    "bar": "1.2.0"   // Less flexible: exact version only
  }
}
```

### 3. Keep Overrides Temporary

Overrides should be temporary solutions. Ideally:
1. Override the problematic version
2. Report the issue to the package maintainers
3. Remove the override once the packages update their dependencies

### 4. Test Thoroughly

Always test your application after adding overrides to ensure:
- The application still works correctly
- No runtime errors occur
- All features function as expected

### 5. Monitor for Updates

Regularly check if the packages you're overriding have been updated:

```bash
pantry outdated
```

Once the upstream packages fix their dependencies, you can remove your overrides.

## Comparison with npm and Yarn

| Feature | Pantry | npm | Yarn |
|---------|--------|-----|------|
| `"overrides"` support | ✅ | ✅ | ❌ |
| `"resolutions"` support | ✅ | ❌ | ✅ |
| Top-level overrides | ✅ | ✅ | ✅ |
| Nested overrides | ❌ | ✅ | ✅ |
| Version ranges | ✅ | ✅ | ✅ |
| GitHub refs | ✅ | ✅ | ✅ |

## Examples from Real Projects

### React Application

```json
{
  "name": "my-react-app",
  "dependencies": {
    "react-router-dom": "^6.0.0",
    "redux": "^4.2.0"
  },
  "overrides": {
    // Ensure all packages use React 18
    "react": "^18.2.0",
    "react-dom": "^18.2.0",

    // Fix security vulnerability
    "minimist": "^1.2.6"
  }
}
```

### TypeScript Project

```json
{
  "name": "my-typescript-project",
  "devDependencies": {
    "eslint": "^8.0.0",
    "jest": "^29.0.0"
  },
  "overrides": {
    // Ensure all tools use same TypeScript version
    "typescript": "~5.0.0",

    // Fix incompatibility issue
    "@types/node": "^18.0.0"
  }
}
```

### Monorepo with Workspaces

```json
{
  "name": "my-monorepo",
  "workspaces": [
    "packages/*"
  ],
  "resolutions": {
    // Ensure all workspace packages use same versions
    "lodash": "^4.17.21",
    "axios": "^1.3.0",

    // Fix cross-package dependency conflicts
    "webpack": "^5.75.0"
  }
}
```

## Further Reading

- [npm overrides documentation](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)
- [Yarn resolutions documentation](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/)
- [Semantic Versioning](https://semver.org/)
- [Pantry Dependency Management](./dependencies.md)

## See Also

- [pantry install](./commands/install.md) - Install dependencies
- [pantry update](./commands/update.md) - Update dependencies
- [pantry outdated](./commands/outdated.md) - Check for outdated packages
- [Package.json specification](./package-json.md) - Full package.json reference
