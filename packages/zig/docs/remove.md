# pantry remove

> Remove dependencies from your project

## Basic Usage

```bash
pantry remove ts-node
```

***

## CLI Usage

```bash
pantry remove <package>
```

### General Information

**--help** - Print this help menu. Alias: `-h`

### Configuration

**--config** `<string>` - Specify path to config file (`pantry.json`)

### Package.json Interaction

**--no-save** `<boolean>` - Don't update `package.json` or save a lockfile

**--save** `<boolean>` (default: `true`) - Save to `package.json` (true by default)

### Execution Control & Validation

**--dry-run** `<boolean>` - Don't remove anything

### Output & Logging

**--silent** `<boolean>` - Don't log anything

**--verbose** `<boolean>` - Excessively verbose logging. Alias: `-v`

### Scope & Path

**--global** `<boolean>` - Remove globally. Alias: `-g`

**--cwd** `<string>` - Set a specific cwd

***

## Examples

### Remove a Single Package

```bash
pantry remove express
```

Removes `express` from dependencies and deletes it from `pantry_modules/`.

### Remove Multiple Packages

```bash
pantry remove express body-parser cors
```

Remove several packages at once.

### Remove Global Package

```bash
pantry remove -g typescript
```

Remove a globally installed package.

### Dry Run

```bash
pantry remove --dry-run lodash
```

See what would be removed without actually removing anything.

### Remove Without Saving

```bash
pantry remove --no-save react
```

Remove the package from `pantry_modules/` but don't update `package.json`.

### Verbose Output

```bash
pantry remove -v webpack
```

Get detailed information about what's being removed.

### Silent Removal

```bash
pantry remove --silent eslint
```

Remove packages without any console output.

***

## Behavior

### Dependencies Check

`pantry remove` will:
1. Check both `dependencies` and `devDependencies`
2. Remove the package from whichever section it's found in
3. Delete the package directory from `pantry_modules/`
4. Update `package.json` (unless `--no-save` is specified)

### Error Handling

If a package is not found in either `dependencies` or `devDependencies`:
- A warning is displayed
- The command continues processing other packages
- Exit code is `1` only if NO packages were found

### Global Removal

When using `--global`:
- Packages are removed from `~/.pantry/global/packages`
- No `package.json` is modified
- Only the global installation directory is affected

***

## Configuration Files

`pantry remove` supports multiple configuration file formats:
- `pantry.json`
- `pantry.jsonc` (JSON with comments)
- `package.json`
- `package.jsonc`

***

## Common Workflows

### Clean Up After Testing

```bash
# Remove test dependencies
pantry remove jest @types/jest ts-jest
```

### Switch Package Managers

```bash
# Remove old package, add new one
pantry remove lodash
pantry add lodash-es
```

### Development Cleanup

```bash
# Remove unused dev dependencies
pantry remove webpack webpack-cli webpack-dev-server
```

***

## Notes

- Packages are removed from `pantry_modules/` immediately
- `package.json` is updated unless `--no-save` is specified
- Lockfile (`.freezer`) is updated automatically
- Global packages can be removed with `-g` flag
- Use `--dry-run` to preview changes before removing

***

## See Also

- [pantry install](./install.md) - Install packages
- [pantry list](./list.md) - List installed packages
- [pantry clean](./clean.md) - Clean dependencies and cache
