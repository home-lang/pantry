# px

> Run packages from npm

<Note>
  `px` is Pantry's package executor, similar to `npx` or `bunx`.
</Note>

Use `px` to auto-install and run packages from npm. It's Pantry's equivalent of `npx` or `bunx`.

```bash
px cowsay "Hello world!"
```

<Note>
  ⚡️ **Speed** — With Pantry's efficient package management, `px` provides fast startup times and quick execution for both locally installed and remote packages.
</Note>

## How it Works

Packages can declare executables in the `"bin"` field of their `package.json`. These are known as *package executables* or *package binaries*.

```json
{
    "name": "my-cli",
    "bin": {
        "my-cli": "dist/index.js"
    }
}
```

These executables are commonly plain JavaScript files marked with a [shebang line](https://en.wikipedia.org/wiki/Shebang_\(Unix\)) to indicate which program should be used to execute them.

```js
#!/usr/bin/env node

console.log("Hello world!");
```

These executables can be run with `px`:

```bash
px my-cli
```

As with `npx` and `bunx`, `px` will:
1. Check for a locally installed package first
2. Fall back to checking global installation
3. Auto-install the package if not found
4. Cache installed packages for future use

## Basic Usage

### Run a Package

```bash
px cowsay "Hello from Pantry!"
```

### Run with Arguments

```bash
px eslint --init
px prettier --write "src/**/*.ts"
```

### Run Specific Version

```bash
px typescript@latest tsc --version
```

***

## CLI Usage

```bash
px <executable> [args...]
```

### Package Selection

**--package `<pkg>`** or **-p `<pkg>`** - Run binary from specific package. Useful when binary name differs from package name:

```bash
px -p renovate renovate-config-validator
px --package @angular/cli ng
```

### Runtime Control

**--pantry** - Use Pantry runtime instead of respecting shebangs. Forces Pantry to execute the script even if it specifies a different runtime.

```bash
px --pantry my-cli
```

The `--pantry` flag must occur *before* the executable name. Flags that appear *after* the name are passed through to the executable.

```bash
px --pantry my-cli     # good
px my-cli --pantry     # bad (passed to executable)
```

### Output Control

**--silent** - Don't log anything

**--verbose** or **-v** - Verbose logging

### General

**--help** or **-h** - Print help menu

***

## Examples

### Quick Testing

```bash
# Test a package before installing
px typescript@5.0.0 tsc --version
```

### Development Tools

```bash
# Format code
px prettier --write .

# Lint code
px eslint src/

# Type check
px tsc --noEmit
```

### Generators & Scaffolding

```bash
# Create React app
px create-react-app my-app

# Initialize project
px create-next-app@latest

# Generate component
px @angular/cli generate component my-component
```

### One-Time Tasks

```bash
# Run database migrations
px prisma migrate deploy

# Build documentation
px typedoc --out docs src/

# Bundle application
px webpack --mode production
```

### Package Testing

```bash
# Test different package versions
px lodash@4.17.20 --version
px lodash@latest --version

# Compare tool outputs
px eslint@7 --version
px eslint@8 --version
```

***

## Behavior

### Package Resolution

1. **Local Check** - First checks `./pantry/.bin/`
2. **Global Check** - Then checks `~/.pantry/global/bin/`
3. **Auto-Install** - Installs package if not found
4. **Cache** - Stores in global cache for future use

### Execution Priority

```
Local Installation → Global Installation → Auto-Install → Execute
```

### Shebang Handling

By default, `px` respects shebangs in executable files:

```js
#!/usr/bin/env node    // Executed with Node.js
#!/usr/bin/env bun     // Executed with Bun
#!/usr/bin/env pantry  // Executed with Pantry
```

Override with `--pantry` flag:

```bash
px --pantry node-script  # Forces Pantry runtime
```

***

## Package Flag Usage

When the binary name differs from the package name:

### Example: Renovate

```bash
px -p renovate renovate-config-validator
```

- **Package**: `renovate`
- **Binary**: `renovate-config-validator`

### Example: Angular CLI

```bash
px --package @angular/cli ng new my-app
```

- **Package**: `@angular/cli`
- **Binary**: `ng`

***

## Common Workflows

### Development

```bash
# Quick script execution
px ts-node script.ts

# Run build tools
px webpack --config webpack.prod.js

# Database operations
px prisma studio
```

### CI/CD

```bash
# Run tests with specific version
px jest@29 --coverage

# Deploy with specific tool version
px vercel@latest deploy

# Audit dependencies
px npm-check-updates -u
```

### Debugging

```bash
# Verbose output for troubleshooting
px -v problematic-tool

# Test package installation
px --verbose cowsay "Installation works!"
```

***

## Comparison

### vs npx

**`px` advantages:**
- Faster package resolution
- Better caching
- Integrated with Pantry's package management
- Consistent with Pantry CLI

**Similar features:**
- Auto-installation
- Local-first resolution
- Version specification support

### vs bunx

**Similar philosophy:**
- Fast execution
- Smart caching
- Modern package management

**`px` specific:**
- Integrated with Pantry ecosystem
- Consistent configuration
- Unified cache management

***

## Advanced Usage

### Version Pinning

```bash
# Run specific version
px typescript@4.9.5 tsc

# Run latest
px typescript@latest tsc

# Run within range
px typescript@^5.0.0 tsc
```

### Complex Arguments

```bash
# Multiple flags
px eslint --fix --ext .ts,.tsx src/

# Quoted arguments
px cowsay "Hello, Pantry!"

# Environment variables
NODE_ENV=production px webpack
```

### Package Scopes

```bash
# Scoped packages
px @angular/cli new my-app
px @vue/cli create my-app

# Organization packages
px @myorg/tool command
```

***

## Configuration

### Environment Variables

- `PANTRY_CACHE_DIR` - Custom cache directory
- `PANTRY_REGISTRY` - Custom npm registry
- `PANTRY_LOG_LEVEL` - Logging verbosity

### pantry.json

Configure default behavior in your project:

```json
{
  "px": {
    "usePantry": true,
    "preferLocal": true
  }
}
```

***

## Troubleshooting

### Package Not Found

```bash
Error: Package 'unknown-tool' not found
```

**Solution:** Check package name spelling or try with full package path:
```bash
px -p full-package-name binary-name
```

### Binary Not Found

```bash
Error: Executable 'tool' not found in package
```

**Solution:** Use `--package` to specify the correct package:
```bash
px --package correct-package-name tool
```

### Permission Errors

```bash
Error: Permission denied
```

**Solution:** Check file permissions or try with elevated privileges if needed.

### Version Conflicts

```bash
Error: Cannot satisfy version constraint
```

**Solution:** Specify exact version:
```bash
px package@1.2.3 command
```

***

## Performance Tips

1. **Use Local Installations** - Install frequently used tools locally for faster access
2. **Leverage Cache** - First run installs, subsequent runs use cache
3. **Pin Versions** - Specific versions resolve faster than ranges
4. **Batch Operations** - Group related commands together

***

## Notes

- Executables are cached globally after first install
- Local packages are always preferred over global
- Shebang lines are respected by default
- Use `--pantry` to override runtime selection
- Package versions can be specified with `@version` syntax

***

## See Also

- [pantry install](./install.md) - Install packages
- [pantry remove](./remove.md) - Remove packages
- [pantry run](./run.md) - Run package scripts
- [pantry list](./list.md) - List installed packages
