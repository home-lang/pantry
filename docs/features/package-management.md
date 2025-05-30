# Package Management

Launchpad provides comprehensive package management capabilities with support for multiple installation strategies and intelligent path handling. This guide covers all aspects of package management.

## Basic Installation

Install packages using the `install` command:

```bash
# Install a single package
launchpad install node@22

# Install multiple packages
launchpad install python@3.12 go@1.21

# Short alias
launchpad i node
```

## Installation Locations

Launchpad supports flexible installation targeting:

### Automatic Location Detection

By default, Launchpad automatically selects the best installation location:

```bash
# Installs to /usr/local if writable, ~/.local otherwise
launchpad install node@22
```

### System-Wide Installation

The default behavior already installs to `/usr/local` for system-wide availability:

```bash
# Default installation (already system-wide)
launchpad install node@22

# Explicit system flag (redundant, same as above)
launchpad install node@22 --system

# Explicit path (equivalent to default when /usr/local is writable)
launchpad install node@22 --path /usr/local
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
launchpad install node@22 --path ~/.local

# Alternative user directory
launchpad install node@22 --path ~/tools
```

### Custom Installation Paths

Install to any directory:

```bash
# Custom installation directory
launchpad install node@22 --path /opt/development

# Project-specific installation
launchpad install node@22 --path ./tools
```

## Installation Options

Customize installation behavior with various options:

```bash
# Verbose installation with detailed output
launchpad install --verbose node@22

# Default installation (already system-wide to /usr/local)
launchpad install python@3.12

# Custom installation path
launchpad install --path ~/tools go@1.21

# Force reinstallation
launchpad install --force node@22

# Install without automatically adding to PATH
launchpad install --no-auto-path typescript
```

### Smart Installation

Use smart installation for automatic fallback to system package managers:

```bash
# Try pkgx first, fallback to brew/apt if needed
launchpad smart-install node python

# Disable fallback behavior
launchpad smart-install --no-fallback go
```

## Package Removal

### Removing Specific Packages

Remove individual packages while keeping your Launchpad setup intact:

```bash
# Remove a single package
launchpad remove python

# Remove multiple packages at once
launchpad remove node python ruby

# Remove specific versions
launchpad remove node@20
launchpad remove python.org@3.10.17

# Remove with aliases
launchpad rm node
launchpad uninstall-package python
```

### Removal Options

Control removal behavior with various options:

```bash
# Preview what would be removed (recommended)
launchpad remove python --dry-run

# Remove without confirmation prompts
launchpad remove python --force

# Verbose output showing all removed files
launchpad remove python --verbose

# Remove from specific installation path
launchpad remove --path ~/my-tools python
```

### What Gets Removed

The `remove` command intelligently identifies and removes:

- **Binaries**: Files in `bin/` and `sbin/` directories
- **Package directories**: Complete package installation directories
- **Symlinks**: Links pointing to the removed package
- **Shims**: Executable shims created for the package
- **Dependencies**: Package-specific files and configurations

### Safe Removal Process

Launchpad ensures safe package removal through:

1. **Package detection**: Finds all versions and files for the specified package
2. **Confirmation prompts**: Asks for confirmation before removal (unless `--force`)
3. **Dry-run mode**: Preview changes with `--dry-run` before actual removal
4. **Detailed reporting**: Shows exactly what was removed, failed, or not found
5. **Selective matching**: Handles both exact matches and pattern matching

## Complete System Cleanup

### Full Uninstallation

Remove Launchpad entirely with the `uninstall` command:

```bash
# Remove everything with confirmation
launchpad uninstall

# Preview complete removal
launchpad uninstall --dry-run

# Remove without prompts
launchpad uninstall --force
```

### Selective Cleanup

Choose what to remove with selective options:

```bash
# Remove only packages, keep shell integration
launchpad uninstall --keep-shell-integration

# Remove only shell integration, keep packages
launchpad uninstall --keep-packages

# Verbose cleanup showing all operations
launchpad uninstall --verbose
```

### Complete Cleanup Process

The `uninstall` command removes:

- **All packages**: Every package installed by Launchpad
- **Installation directories**: `bin/`, `sbin/`, `pkgs/` directories
- **Shell integration**: Removes lines from `.zshrc`, `.bashrc`, etc.
- **Shim directories**: All created shim directories
- **Configuration**: Provides guidance for manual PATH cleanup

## Bootstrap Setup

### Quick Setup

Get everything you need with one command:

```bash
# Install all essential tools
launchpad bootstrap

# Verbose bootstrap showing all operations
launchpad bootstrap --verbose

# Force reinstall everything
launchpad bootstrap --force
```

### Customized Bootstrap

Control what gets installed:

```bash
# Skip specific components
launchpad bootstrap --skip-pkgx
launchpad bootstrap --skip-bun
launchpad bootstrap --skip-shell-integration

# Custom installation path
launchpad bootstrap --path ~/.local

# Disable automatic PATH modification
launchpad bootstrap --no-auto-path
```

### Bootstrap Components

The bootstrap process installs:

- **pkgx**: Core package manager
- **Bun**: JavaScript runtime
- **PATH setup**: Configures both `bin/` and `sbin/` directories
- **Shell integration**: Sets up auto-activation hooks
- **Progress reporting**: Shows success/failure for each component

## Package Listing

### View Installed Packages

See what's currently installed:

```bash
# List all packages
launchpad list

# Shorthand
launchpad ls

# Verbose listing with paths
launchpad list --verbose

# List from specific path
launchpad list --path ~/my-tools
```

## Version Management

### Handling Multiple Versions

Launchpad supports multiple versions of the same package:

```bash
# Install multiple versions
launchpad install node@20 node@22

# List to see all versions
launchpad list

# Remove specific version
launchpad remove node@20

# Keep other versions intact
```

### Version Specification

Support for various version formats:

```bash
# Exact version
launchpad install node@22.1.0

# Major version
launchpad install python@3

# Version with package domain
launchpad install python.org@3.12.0
```

## Best Practices

### Safe Package Management

1. **Always dry-run first**: Use `--dry-run` for major operations
2. **List before removing**: Check `launchpad list` to see what's installed
3. **Use specific versions**: Specify versions to avoid conflicts
4. **Regular cleanup**: Remove unused packages to save space

### Choosing the Right Command

- **`remove`**: For removing specific packages while keeping Launchpad
- **`uninstall`**: For complete system cleanup and fresh start
- **`bootstrap`**: For initial setup or recovering from issues
- **`list`**: To audit what's currently installed

### Error Recovery

If something goes wrong:

```bash
# Check what's still installed
launchpad list

# Try to clean up broken installations
launchpad uninstall --dry-run

# Fresh start with bootstrap
launchpad bootstrap --force
```

## Troubleshooting

### Common Issues

**Package not found during removal**:
```bash
# Check exact package names
launchpad list

# Use verbose mode for details
launchpad remove package-name --verbose
```

**Permission errors**:
```bash
# Use sudo if needed
sudo launchpad remove package-name

# Or install to user directory
launchpad install --path ~/.local package-name
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
launchpad help
launchpad remove --help
launchpad uninstall --help
launchpad bootstrap --help
```
