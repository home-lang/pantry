# Package Management

pantry provides comprehensive package management capabilities with support for multiple installation strategies and intelligent path handling. This guide covers all aspects of package management.

## Basic Installation

Install packages using the `install` command:

```bash
# Install a single package
pantry install node@22

# Install multiple packages
pantry install python@3.12 go@1.21

# Short alias
pantry i node
```

## Installation Locations

pantry supports flexible installation targeting:

### Automatic Location Detection

By default, pantry automatically selects the best installation location:

```bash
# Installs to /usr/local if writable, ~/.local otherwise
pantry install node@22
```

### Global vs Local Installation via Dependencies

Control installation location using the `global` flag in dependency files:

#### Individual Package Global Flags

```yaml
# dependencies.yaml
dependencies:
# Global installation (system-wide, available everywhere)
  node@22:
    version: 22.1.0
    global: true

# Local installation (project-specific, isolated)
  typescript@5.0:
    version: 5.0.4
    global: false

# String format defaults to local installation

  - eslint@8.50

env:
  NODE_ENV: development
```

#### Top-Level Global Flag

Apply global installation to all dependencies by default:

```yaml
# dependencies.yaml
global: true  # Install all packages globally unless overridden
dependencies:

  - node@22
  - python@3.12
  - git@2.42

# Selective override to local installation
  typescript@5.0:
    version: 5.0.4
    global: false

env:
  NODE_ENV: development
```

#### Global Flag Benefits

**Global Installation** (`global: true`):

- Packages available system-wide across all projects
- Installed to `/usr/local` (or configured global path)
- Shared dependencies reduce disk usage
- Consistent tool versions across projects

**Local Installation** (`global: false` or default):

- Perfect project isolation
- No version conflicts between projects
- Project-specific configurations
- Easy cleanup when project is removed

**Mixed Approach** (recommended):

- Core development tools global (node, python, git)
- Project-specific tools local (linters, test frameworks)
- Best of both worlds: convenience + isolation

### System-Wide Installation

The default behavior already installs to `/usr/local` for system-wide availability:

```bash
# Default installation (already system-wide)
pantry install node@22

# Explicit path (equivalent to default when /usr/local is writable)
pantry install node@22 --path /usr/local
```

**Permission Handling**: When installing to `/usr/local`:

- Automatically detects permission requirements
- Prompts for sudo authorization in interactive mode
- Provides clear alternatives if sudo is declined
- Handles non-interactive environments gracefully

### User-Local Installation

Install packages to user-specific directories:

```bash
# Force user-local installation
pantry install node@22 --path ~/.local

# Alternative user directory
pantry install node@22 --path ~/tools
```

### Custom Installation Paths

Install to any directory:

```bash
# Custom installation directory
pantry install node@22 --path /opt/development

# Project-specific installation
pantry install node@22 --path ./tools
```

## Installation Options

Customize installation behavior with various options:

```bash
# Verbose installation with detailed output
pantry install --verbose node@22

# Default installation (already system-wide to /usr/local)
pantry install python@3.12

# Custom installation path
pantry install --path ~/tools go@1.21

# Force reinstallation
pantry install --force node@22
```

### Package Registry

pantry uses the pkgx registry through ts-pkgx for package installation:

```bash
# Install from the pkgx registry
pantry install node@22 python@3.12

# Search for available packages
pantry search node
pantry info python
```

## Package Removal

### Removing Specific Packages

Remove individual packages while keeping your pantry setup intact:

```bash
# Remove a single package
pantry remove python

# Remove multiple packages at once
pantry remove node python ruby

# Remove specific versions
pantry remove node@20
pantry remove python.org@3.10.17
```

### Removal Options

Control removal behavior with various options:

```bash
# Preview what would be removed (recommended)
pantry remove python --dry-run

# Remove without confirmation prompts
pantry remove python --force

# Verbose output showing all removed files
pantry remove python --verbose

# Remove from specific installation path
pantry remove --path ~/my-tools python
```

### What Gets Removed

The `remove` command intelligently identifies and removes:

- **Binaries**: Files in `bin/` and `sbin/` directories
- **Package directories**: Complete package installation directories
- **Symlinks**: Links pointing to the removed package
- **Shims**: Executable shims created for the package
- **Dependencies**: Package-specific files and configurations

### Safe Removal Process

pantry ensures safe package removal through:

1. **Package detection**: Finds all versions and files for the specified package
2. **Confirmation prompts**: Asks for confirmation before removal (unless `--force`)
3. **Dry-run mode**: Preview changes with `--dry-run` before actual removal
4. **Detailed reporting**: Shows exactly what was removed, failed, or not found
5. **Selective matching**: Handles both exact matches and pattern matching

## Package Updates

Keep your packages up-to-date with pantry's intelligent update system:

### Basic Updates

```bash
# Update all installed packages
pantry update

# Update specific packages
pantry update node python

# Use aliases for convenience
pantry upgrade bun
pantry up node python
```

### Update Options

Control update behavior with various options:

```bash
# Preview what would be updated
pantry update --dry-run

# Force update to latest versions (ignore constraints)
pantry upgrade bun --latest

# Verbose output showing update details
pantry update --verbose node

# Update multiple packages with latest flag
pantry up node python --latest
```

### Update Process

pantry's update system provides:

1. **Version checking**: Compares installed versions with latest available
2. **Smart updates**: Only updates when newer versions are available
3. **Constraint respect**: Honors version constraints unless `--latest` is used
4. **Helpful messages**: Provides installation instructions for uninstalled packages
5. **Dry-run mode**: Preview updates safely before applying changes

### Version Switching on cd

pantry encodes dependency versions into the environment directory via a dependency fingerprint (md5 of your dependency file). When you change pinned versions in your dependency file and `cd` into the project, pantry automatically selects a new env path:

```
~/.local/share/pantry/envs/<project>_<hash>-d<dep_hash>
```

This guarantees immediate version switches without manual cleanup. Enable verbose logs to see the chosen `env_dir`, dependency file, and fingerprint:

```bash
export PANTRY_VERBOSE=true
cd my-project
# 🔍 Env target: env_dir=… dep_file=… dep_hash=…
```

### Update Examples

```bash
# Check and update all packages
pantry update

# Update Node.js to latest version
pantry upgrade node --latest

# Preview updates for specific packages
pantry up bun python --dry-run

# Update with verbose output
pantry update --verbose --latest node
```

## Complete System Cleanup

### Full Uninstallation

Remove pantry entirely with the `uninstall` command:

```bash
# Remove everything with confirmation
pantry uninstall

# Preview complete removal
pantry uninstall --dry-run

# Remove without prompts
pantry uninstall --force
```

### Selective Cleanup

Choose what to remove with selective options:

```bash
# Remove only shell integration, keep packages
pantry uninstall --keep-packages

# Verbose cleanup showing all operations
pantry uninstall --verbose
```

### Complete Cleanup Process

The `uninstall` command removes:

- **All packages**: Every package installed by pantry
- **Installation directories**: `bin/`, `sbin/`, `pkgs/` directories
- **Shell integration**: Removes lines from `.zshrc`, `.bashrc`, etc.
- **Shim directories**: All created shim directories
- **Configuration**: Provides guidance for manual PATH cleanup

## Bootstrap Setup

### Quick Setup

Get everything you need with one command:

```bash
# Install all essential tools
pantry bootstrap

# Verbose bootstrap showing all operations
pantry bootstrap --verbose

# Force reinstall everything
pantry bootstrap --force
```

### Customized Bootstrap

Control what gets installed:

```bash
# Skip specific components
pantry bootstrap --skip-shell-integration

# Custom installation path
pantry bootstrap --path ~/.local

# Disable automatic PATH modification
pantry bootstrap --no-auto-path
```

### Bootstrap Components

The bootstrap process installs:

- **ts-pkgx**: Core package registry integration
- **Bun**: JavaScript runtime
- **PATH setup**: Configures both `bin/` and `sbin/` directories
- **Shell integration**: Sets up auto-activation hooks
- **Progress reporting**: Shows success/failure for each component

## Package Listing

### View Installed Packages

See what's currently installed:

```bash
# List all packages
pantry list

# Verbose listing with paths
pantry list --verbose

# List from specific path
pantry list --path ~/my-tools
```

## Version Management

### Handling Multiple Versions

pantry supports multiple versions of the same package:

```bash
# Install multiple versions
pantry install node@20 node@22

# List to see all versions
pantry list

# Remove specific version
pantry remove node@20

# Keep other versions intact
```

### Version Specification

Support for various version formats:

```bash
# Exact version
pantry install node@22.1.0

# Major version
pantry install python@3

# Version with package domain
pantry install python.org@3.12.0
```

## Best Practices

### Safe Package Management

1. **Always dry-run first**: Use `--dry-run` for major operations
2. **List before removing**: Check `pantry list` to see what's installed
3. **Use specific versions**: Specify versions to avoid conflicts
4. **Regular cleanup**: Remove unused packages to save space

### Choosing the Right Command

- **`remove`**: For removing specific packages while keeping pantry
- **`uninstall`**: For complete system cleanup and fresh start
- **`bootstrap`**: For initial setup or recovering from issues
- **`list`**: To audit what's currently installed

### Error Recovery

If something goes wrong:

```bash
# Check what's still installed
pantry list

# Try to clean up broken installations
pantry uninstall --dry-run

# Fresh start with bootstrap
pantry bootstrap --force
```

## Troubleshooting

### Common Issues

**Package not found during removal**:

```bash
# Check exact package names
pantry list

# Use verbose mode for details
pantry remove package-name --verbose
```

**Permission errors**:

```bash
# Use sudo if needed
sudo pantry remove package-name

# Or install to user directory
pantry install --path ~/.local package-name
```

**PATH issues after removal**:

```bash
# Check PATH in new shell
echo $PATH

# Restart shell or source config
source ~/.zshrc
```

### Getting Help

For detailed help with any command:

```bash
pantry help
pantry remove --help
pantry uninstall --help
pantry bootstrap --help
```
