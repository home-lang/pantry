# pantry update

> Update dependencies to latest versions

<Note>To upgrade your Pantry CLI version, use `pantry upgrade` or reinstall from pkgx.</Note>

To update all dependencies to the latest version:

```bash
pantry update
```

To update a specific dependency to the latest version:

```bash
pantry update [package]
```

## `--latest`

By default, `pantry update` will update to the latest version of a dependency that satisfies the version range specified in your `package.json`.

To update to the latest version, regardless of if it's compatible with the current version range, use the `--latest` flag:

```bash
pantry update --latest
```

For example, with the following `package.json`:

```json
{
    "dependencies": {
        "react": "^17.0.2"
    }
}
```

* `pantry update` would update to a version that matches `17.x`.
* `pantry update --latest` would update to a version that matches `18.x` or later.

***

## CLI Usage

```bash
pantry update <package> <version>
```

### Update Strategy

**--force** `<boolean>` - Always request the latest versions from the registry & reinstall all dependencies. Alias: `-f`

**--latest** `<boolean>` - Update packages to their latest versions (ignore semver constraints)

### Dependency Scope

**--production** `<boolean>` - Don't update devDependencies. Alias: `-p`

**--global** `<boolean>` - Update globally. Alias: `-g`

### Project File Management

**--no-save** `<boolean>` - Don't update `package.json` or save a lockfile

**--save** `<boolean>` (default: `true`) - Save to `package.json` (true by default)

### Execution Control

**--dry-run** `<boolean>` - Don't update anything (preview mode)

### Output & Logging

**--silent** `<boolean>` - Don't log anything

**--verbose** `<boolean>` - Excessively verbose logging. Alias: `-v`

### General

**--config** `<string>` - Specify path to config file (`pantry.json`)

**--cwd** `<string>` - Set a specific cwd

**--help** `<boolean>` - Print this help menu. Alias: `-h`

***

## Examples

### Update All Packages

```bash
pantry update
```

Updates all dependencies and devDependencies to their latest semver-compatible versions.

### Update Specific Package

```bash
pantry update react
```

Updates only the `react` package.

### Update Multiple Packages

```bash
pantry update react react-dom lodash
```

Updates multiple packages at once.

### Update to Latest (Breaking Changes)

```bash
pantry update --latest
```

Updates all packages to their absolute latest versions, ignoring semver constraints. This may include breaking changes.

### Update Specific Package to Latest

```bash
pantry update react --latest
```

Updates `react` to its absolute latest version.

### Dry Run

```bash
pantry update --dry-run
```

Preview what would be updated without making any changes.

### Update Production Dependencies Only

```bash
pantry update --production
```

Updates only `dependencies`, skipping `devDependencies`.

### Force Update

```bash
pantry update --force
```

Forces a complete reinstall and update of all packages.

### Global Update

```bash
pantry update -g typescript
```

Updates a globally installed package.

### Silent Update

```bash
pantry update --silent
```

Updates without any console output.

### Verbose Update

```bash
pantry update -v
```

Shows detailed information about the update process.

***

## Behavior

### Version Resolution

**Semver-Compatible (default):**
- Respects version constraints in `package.json`
- `^1.2.3` updates to latest `1.x.x`
- `~1.2.3` updates to latest `1.2.x`
- `>=1.2.3` updates to latest available

**Latest Mode (`--latest`):**
- Ignores semver constraints
- Always updates to the absolute latest version
- May introduce breaking changes
- Updates `package.json` with new version range

### Update Process

1. **Read Configuration** - Parses `package.json` or `pantry.json`
2. **Check Registry** - Fetches latest version information
3. **Resolve Versions** - Determines target versions based on constraints
4. **Download & Install** - Installs updated packages
5. **Update Lockfile** - Updates `.freezer` with new versions
6. **Update Config** - Updates `package.json` if `--save` is true

### Dependency Groups

Updates are applied to:
- **dependencies** - Always updated
- **devDependencies** - Updated unless `--production` flag is used
- **optionalDependencies** - Updated if present
- **peerDependencies** - Not automatically updated

***

## Configuration Files

`pantry update` supports multiple configuration file formats:
- `pantry.json`
- `pantry.jsonc` (JSON with comments)
- `package.json`
- `package.jsonc`

***

## Common Workflows

### Regular Updates

```bash
# Weekly update routine
pantry update --dry-run  # Preview changes
pantry update            # Apply updates
```

### Major Version Upgrades

```bash
# Upgrade to latest React
pantry update react --latest

# Test your app
npm test

# If successful, commit
git add package.json pantry
git commit -m "chore: upgrade react to latest"
```

### Security Updates

```bash
# Update all packages to patch vulnerabilities
pantry update --force
```

### Pre-Production Check

```bash
# Update production dependencies only
pantry update --production

# Run tests
pantry run test

# Deploy if tests pass
pantry run deploy
```

***

## Update Strategies

### Conservative (Recommended)

```bash
# Respects semver, safer updates
pantry update
```

**Pros:**
- Lower risk of breaking changes
- Follows semantic versioning
- Easier to debug issues

**Cons:**
- May miss important features
- Could miss security patches in major versions

### Aggressive

```bash
# Always latest, higher risk
pantry update --latest
```

**Pros:**
- Always on cutting edge
- Access to latest features
- Best security coverage

**Cons:**
- Higher risk of breaking changes
- More time spent on updates
- May require code changes

### Hybrid

```bash
# Update most packages conservatively
pantry update

# Update specific packages to latest
pantry update typescript eslint --latest
```

**Best of both worlds:**
- Safe updates for core dependencies
- Latest versions for dev tools
- Balanced approach

***

## Version Constraint Syntax

`pantry update` respects version constraints:

| Constraint | Example | Updates To |
|------------|---------|------------|
| Caret | `^1.2.3` | `1.x.x` (latest minor/patch) |
| Tilde | `~1.2.3` | `1.2.x` (latest patch) |
| Greater Than | `>=1.2.3` | Latest available |
| Exact | `1.2.3` | No update (use `--latest`) |
| Range | `1.2.3 - 2.0.0` | Within range |
| Wildcard | `1.2.x` | Latest `1.2.x` |

***

## Troubleshooting

### Package Not Found

```bash
Error: Package 'some-package' not found in dependencies
```

**Solution:** Check package name spelling or use `pantry install` to add it first.

### Version Conflict

```bash
Error: Cannot update 'package-a' due to peer dependency conflict
```

**Solution:** Use `--latest` to override, or update peer dependencies first.

### Network Issues

```bash
Error: Failed to fetch package metadata
```

**Solution:** Check internet connection or try `--registry` with alternative registry.

***

## Notes

- Updates respect `minimumReleaseAge` configuration (default: 3 days)
- Packages in `minimumReleaseAgeExcludes` can be updated immediately
- Use `--dry-run` to preview changes before applying
- Lockfile (`.freezer`) is automatically updated
- Use `--no-save` to update `pantry` without changing `package.json`

***

## See Also

- [pantry install](./install.md) - Install packages
- [pantry remove](./remove.md) - Remove packages
- [pantry list](./list.md) - List installed packages
- [pantry clean](./clean.md) - Clean dependencies and cache
