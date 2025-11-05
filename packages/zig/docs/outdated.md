# outdated

> Check for outdated dependencies

Use `pantry outdated` to check for outdated dependencies in your project. This command displays a table of dependencies that have newer versions available.

```bash
pantry outdated
```

```txt
| Package                        | Current | Update    | Latest     |
| ------------------------------ | ------- | --------- | ---------- |
| @sinclair/typebox              | 0.34.15 | 0.34.16   | 0.34.16    |
| @types/bun (dev)               | 1.2.0   | 1.2.23    | 1.2.23     |
| eslint (dev)                   | 8.57.1  | 8.57.1    | 9.20.0     |
| prettier (dev)                 | 3.4.2   | 3.5.0     | 3.5.0      |
| typescript (dev)               | 5.7.2   | 5.7.3     | 5.7.3      |
```

## Version Information

The output table shows three version columns:

* **Current**: The version currently installed
* **Update**: The latest version that satisfies your package.json version range
* **Latest**: The latest version published to the registry

### Dependency Filters

`pantry outdated` supports searching for outdated dependencies by package names and glob patterns.

To check if specific dependencies are outdated, pass the package names as positional arguments:

```bash
pantry outdated eslint prettier
```

```txt
| Package                        | Current | Update | Latest    |
| ------------------------------ | ------- | ------ | --------- |
| eslint (dev)                   | 8.57.1  | 8.57.1 | 9.20.0    |
| prettier (dev)                 | 3.4.2   | 3.5.0  | 3.5.0     |
```

You can also pass glob patterns to check for outdated packages:

```bash
pantry outdated eslint*
```

```txt
| Package                        | Current | Update | Latest     |
| ------------------------------ | ------- | ------ | ---------- |
| eslint (dev)                   | 8.57.1  | 8.57.1 | 9.20.0     |
```

For example, to check for outdated `@types/*` packages:

```bash
pantry outdated '@types/*'
```

```txt
| Package            | Current | Update | Latest |
| ------------------ | ------- | ------ | ------ |
| @types/bun (dev)   | 1.2.0   | 1.2.23 | 1.2.23 |
```

Or to exclude all `@types/*` packages:

```bash
pantry outdated '!@types/*'
```

```txt
| Package                        | Current | Update    | Latest     |
| ------------------------------ | ------- | --------- | ---------- |
| @sinclair/typebox              | 0.34.15 | 0.34.16   | 0.34.16    |
| eslint (dev)                   | 8.57.1  | 8.57.1    | 9.20.0     |
| prettier (dev)                 | 3.4.2   | 3.5.0     | 3.5.0      |
| typescript (dev)               | 5.7.2   | 5.7.3     | 5.7.3      |
```

### Workspace Filters

Use the `--filter` flag to check for outdated dependencies in a different workspace package:

```bash
pantry outdated --filter='@monorepo/types'
```

```txt
| Package            | Current | Update | Latest |
| ------------------ | ------- | ------ | ------ |
| typescript (dev)   | 5.7.2   | 5.7.3  | 5.7.3  |
```

You can pass multiple `--filter` flags to check multiple workspaces:

```bash
pantry outdated --filter @monorepo/types --filter @monorepo/cli
```

You can also pass glob patterns to filter by workspace names:

```bash
pantry outdated --filter='@monorepo/{types,cli}'
```

***

## CLI Usage

```bash
pantry outdated <filter>
```

### General Options

**-F, --filter `<workspace>`** - Display outdated dependencies for each matching workspace

**-h, --help** - Print help menu

### Output & Logging

**--silent** - Don't log anything

**--verbose** or **-v** - Verbose logging

**--no-progress** - Disable the progress bar

### Dependency Scope

**-p, --production** - Check only production dependencies (skip devDependencies)

**-g, --global** - Check global packages

***

## Examples

### Basic Usage

Check all dependencies:

```bash
pantry outdated
```

### Check Specific Packages

Check if lodash and axios are outdated:

```bash
pantry outdated lodash axios
```

### Use Glob Patterns

Check all eslint-related packages:

```bash
pantry outdated 'eslint*'
```

Check all @babel packages:

```bash
pantry outdated '@babel/*'
```

### Exclude Patterns

Check all packages except type definitions:

```bash
pantry outdated '!@types/*'
```

### Production Only

Check only production dependencies:

```bash
pantry outdated --production
```

### Verbose Output

Get detailed information:

```bash
pantry outdated --verbose
```

***

## Output Format

The `outdated` command displays results in a clean table format:

```txt
| Package                        | Current | Update    | Latest     |
| ------------------------------ | ------- | --------- | ---------- |
| package-name                   | 1.0.0   | 1.0.5     | 2.0.0      |
| @scope/package (dev)           | 2.1.0   | 2.1.3     | 2.1.3      |
```

### Column Descriptions

1. **Package**: Package name with (dev) marker for devDependencies
2. **Current**: Version currently specified in package.json
3. **Update**: Latest version within semver range
4. **Latest**: Latest version available (may be outside range)

### Reading the Output

- When **Update** ≠ **Latest**: A newer major version exists but breaks semver constraints
- When **Current** = **Update** = **Latest**: Package is fully up to date
- When **Current** ≠ **Update**: An update is available within your version range

***

## Understanding Version Ranges

Pantry respects semver ranges in your package.json:

| Range        | Current | Update | Latest | Meaning                           |
| ------------ | ------- | ------ | ------ | --------------------------------- |
| `^1.0.0`     | 1.0.0   | 1.5.2  | 2.0.0  | Patch/minor updates available     |
| `~2.3.0`     | 2.3.0   | 2.3.5  | 3.0.0  | Patch updates only                |
| `*`          | 1.0.0   | 5.0.0  | 5.0.0  | Any version                       |
| `1.2.3`      | 1.2.3   | 1.2.3  | 2.0.0  | Exact version pinned              |

### Semver Constraints

- `^` (caret): Compatible with minor/patch updates
- `~` (tilde): Compatible with patch updates only
- `*`: Any version
- Exact: No updates unless you change package.json

***

## Common Workflows

### Check Before Updating

```bash
# See what's outdated
pantry outdated

# Update to latest compatible versions
pantry update

# Update to latest regardless of semver
pantry update --latest
```

### Focus on Specific Packages

```bash
# Check only TypeScript ecosystem
pantry outdated 'typescript' '@types/*'

# Check only React ecosystem
pantry outdated 'react' 'react-*' '@types/react*'
```

### Workspace Maintenance

```bash
# Check specific workspace
pantry outdated --filter '@myapp/web'

# Check all workspaces
pantry outdated --filter '*'
```

### Production vs Development

```bash
# Check only production dependencies
pantry outdated --production

# Check dev dependencies by excluding production
# (view all, then filter manually)
pantry outdated
```

***

## Integration with Update

Use `outdated` to preview before `update`:

```bash
# 1. Check what's outdated
pantry outdated

# 2. Update specific packages
pantry update lodash axios

# 3. Update everything (semver-compatible)
pantry update

# 4. Update to latest (breaking changes)
pantry update --latest
```

***

## Troubleshooting

### No Packages Shown

If no packages appear outdated:

```bash
✓ All dependencies are up to date!
```

This means:
- All packages are at their latest compatible versions
- No newer versions exist within your semver ranges

### Package Not Found

```txt
Error: No package.json or pantry.json found
```

**Solution**: Run the command in a directory with a package.json file

### JSONC Support

Pantry automatically handles JSON with comments (.jsonc files):

```json
{
  // Your packages
  "dependencies": {
    "lodash": "^4.17.20" // Utility library
  }
}
```

No special flags needed - it just works!

***

## Performance

The `outdated` command is designed to be fast:

- **Local checking**: Reads from package.json directly
- **No network calls**: Version comparisons done locally (in current implementation)
- **Smart filtering**: Only processes packages matching your filters

***

## Comparison with Other Tools

### vs npm outdated

**Similar features:**
- Table format output
- Semver range awareness
- Filter support

**Pantry specific:**
- Faster execution
- JSONC support built-in
- Consistent with Pantry CLI style

### vs yarn outdated

**Similar philosophy:**
- Shows Current, Update, Latest columns
- Workspace support
- Pattern matching

**Pantry specific:**
- Integrated with Pantry package management
- Unified cache system
- Cross-platform consistency

***

## Exit Codes

- `0`: Success (packages may or may not be outdated)
- `1`: Error (no package.json found, parse error, etc.)

***

## Notes

- Dev dependencies are marked with `(dev)` in the output
- Scoped packages (`@scope/name`) are fully supported
- Glob patterns use `*` for wildcard matching
- Negation patterns start with `!`
- The command shows all packages by default
- Filter patterns are case-sensitive

***

## See Also

- [pantry update](./update.md) - Update packages to newer versions
- [pantry install](./install.md) - Install packages
- [pantry list](./list.md) - List installed packages
- [pantry remove](./remove.md) - Remove packages
