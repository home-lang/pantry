# pantry why

> Explain why a package is installed and show its dependency chain

The `pantry why` command helps you understand why a particular package exists in your project by showing the dependency chain that leads to it. This is especially useful for debugging dependency conflicts, understanding transitive dependencies, and auditing your dependency tree.

## Usage

```bash
pantry why <package>
```

## Arguments

### `package`

The name of the package to explain. Supports glob patterns for matching multiple packages.

**Examples:**
- Exact match: `pantry why react`
- Prefix glob: `pantry why @types/*`
- Suffix glob: `pantry why *-loader`
- Wildcard: `pantry why lodash*`

## Options

### `--top`

Show only the top-level dependency that requires this package, without displaying the full dependency tree.

```bash
pantry why react --top
```

### `--depth <number>`

Limit the depth of the dependency tree displayed. Useful for large projects with deep dependency chains.

```bash
pantry why react --depth 3
```

## Examples

### Basic Usage

Show why a specific package is installed:

```bash
$ pantry why react

react@^18.0.0
  └─ my-app@1.0.0 (requires ^18.0.0)
```

### Using Glob Patterns

Find all TypeScript type definitions:

```bash
$ pantry why "@types/*"

@types/react@^18.0.0
  └─ dev my-app@1.0.0 (requires ^18.0.0)

@types/node@^20.0.0
  └─ dev my-app@1.0.0 (requires ^20.0.0)

Found 2 package(s) matching '@types/*'
```

Find packages with a common suffix:

```bash
$ pantry why "*-loader"

css-loader@^6.0.0
  └─ webpack@5.0.0
    └─ my-app@1.0.0 (requires ^5.0.0)

style-loader@^3.0.0
  └─ webpack@5.0.0
    └─ my-app@1.0.0 (requires ^5.0.0)

Found 2 package(s) matching '*-loader'
```

### Top-Level Only

When you only care about which direct dependency requires a package:

```bash
$ pantry why lodash --top

lodash@^4.17.21
  └─ my-app@1.0.0 (requires ^4.17.21)
```

### Limiting Tree Depth

For complex dependency chains, limit the depth to keep output manageable:

```bash
$ pantry why some-deep-package --depth 2

some-deep-package@1.0.0
  └─ intermediate-package@2.0.0
    └─ (deeper dependencies hidden)
```

### Finding Multiple Packages

Use wildcards to find multiple related packages:

```bash
$ pantry why "lodash*"

lodash@^4.17.21
  └─ my-app@1.0.0 (requires ^4.17.21)

lodash-es@^4.17.21
  └─ modern-lib@2.0.0
    └─ my-app@1.0.0 (requires ^2.0.0)

lodash-fp@^0.10.4
  └─ functional-lib@1.0.0
    └─ my-app@1.0.0 (requires ^1.0.0)

Found 3 package(s) matching 'lodash*'
```

## Dependency Types

The command indicates the type of dependency:

- **No prefix**: Regular dependency (from `dependencies`)
- **dev**: Development dependency (from `devDependencies`)
- **peer**: Peer dependency (from `peerDependencies`)
- **optional**: Optional dependency (from `optionalDependencies`)

Example output showing dependency types:

```bash
$ pantry why typescript

typescript@^5.0.0
  └─ dev my-app@1.0.0 (requires ^5.0.0)
```

## Understanding the Output

The output shows a dependency tree with indentation indicating the hierarchy:

```
package-name@version
  └─ [type] direct-dependency@version (requires version-range)
    └─ [type] your-project@version (requires version-range)
```

- **package-name@version**: The package you queried
- **[type]**: Dependency type (dev, peer, optional, or blank for regular)
- **direct-dependency**: The package that requires the queried package
- **(requires version-range)**: The version constraint specified

## Common Use Cases

### 1. Debugging Duplicate Dependencies

Find out why you have multiple versions of the same package:

```bash
$ pantry why react
# Shows all dependency chains leading to react
# Helps identify which packages are pulling in different versions
```

### 2. Audit Development Dependencies

Check why certain dev tools are installed:

```bash
$ pantry why "@types/*"
# Lists all TypeScript type definitions and why they're needed
```

### 3. Understanding Bundle Size

Investigate why certain packages are in your bundle:

```bash
$ pantry why moment --depth 1
# Shows which direct dependencies use moment
# Helps decide if you should switch to a lighter alternative
```

### 4. Dependency Cleanup

Before removing a package, check what depends on it:

```bash
$ pantry why some-package
# If nothing shows up, it's safe to remove
# If dependencies exist, you'll see what needs it
```

### 5. Workspace Package Analysis

In monorepos, understand cross-workspace dependencies:

```bash
$ pantry why @myorg/shared-utils
# Shows which workspace packages depend on your shared utilities
```

## JSONC Support

The `why` command fully supports JSONC (JSON with Comments) configuration files:

```jsonc
// package.jsonc
{
  // Project dependencies
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0" // UI framework
  },
  "devDependencies": {
    "@types/react": "^18.0.0" // Type definitions
  }
}
```

```bash
$ pantry why react
# Works seamlessly with package.jsonc
```

## Error Handling

### Package Not Found

If a package isn't in your dependencies:

```bash
$ pantry why nonexistent-package

Package 'nonexistent-package' not found in dependencies
```

### No Package Specified

If you run the command without arguments:

```bash
$ pantry why

Error: No package specified
Usage: pantry why <package> [options]
```

### No Config File

If no package.json or package.jsonc exists:

```bash
$ pantry why react

Error: No package.json or pantry.json found
```

## Configuration Files

The command searches for configuration files in this order:

1. `pantry.json`
2. `pantry.jsonc`
3. `package.json`
4. `package.jsonc`

It uses the first file found in the current directory.

## Performance Tips

1. **Use glob patterns carefully**: Overly broad patterns like `*` will match many packages
2. **Use --top for quick lookups**: When you only need to know the direct dependency
3. **Use --depth for large projects**: Limit output size in complex dependency trees

## Related Commands

- [`pantry list`](./list.md) - List all installed packages
- [`pantry outdated`](./outdated.md) - Check for outdated packages
- [`pantry update`](./update.md) - Update packages to latest versions
- [`pantry remove`](./remove.md) - Remove packages from your project

## Comparison with npm/yarn/bun

| Feature | pantry | npm | yarn | bun |
|---------|--------|-----|------|-----|
| Basic why | ✅ | ✅ `npm explain` | ✅ `yarn why` | ✅ `bun why` |
| Glob patterns | ✅ | ❌ | ❌ | ✅ |
| Top-level only | ✅ `--top` | ❌ | ❌ | ✅ `--top` |
| Depth limiting | ✅ `--depth` | ❌ | ❌ | ✅ `--depth` |
| JSONC support | ✅ | ❌ | ❌ | ❌ |
| Dep type indication | ✅ | ✅ | ✅ | ✅ |

## Troubleshooting

### Issue: Pattern matches too many packages

**Solution**: Make your glob pattern more specific:

```bash
# Too broad
pantry why "*"

# More specific
pantry why "@types/*"
pantry why "webpack-*"
```

### Issue: Tree is too deep to read

**Solution**: Use the `--depth` option:

```bash
pantry why some-package --depth 2
```

### Issue: Want to see only direct dependencies

**Solution**: Use the `--top` flag:

```bash
pantry why some-package --top
```

## Advanced Patterns

### Finding All Babel-Related Packages

```bash
$ pantry why "babel*" --top

babel-loader@^9.0.0
  └─ my-app@1.0.0 (requires ^9.0.0)

@babel/core@^7.22.0
  └─ my-app@1.0.0 (requires ^7.22.0)

Found 2 package(s) matching 'babel*'
```

### Checking Scoped Packages

```bash
$ pantry why "@aws-sdk/*"

# Shows all AWS SDK packages and their dependency chains
```

### Workspace-Specific Packages

```bash
$ pantry why "@myorg/*"

# Lists all internal workspace packages and why they're installed
```

## See Also

- [Configuration Guide](./config.md)
- [Dependency Syntax Guide](./DEPENDENCY_SYNTAX_GUIDE.md)
- [Workspace Support](./workspaces.md)
- [CLI Reference](./cli.md)
