# Package Management

One of the core features of Launchpad is its ability to manage packages through multiple installation approaches, with pkgx as the primary engine and automatic fallbacks to system package managers.

## Installation Methods

Launchpad provides several installation approaches:

### Regular Installation

Installing packages with Launchpad using pkgx:

```bash
# Install a single package
launchpad install node

# Install multiple packages at once
launchpad install python@3.12 ruby@3.3 go@1.23

# Use the shorthand
launchpad i node@22 python@3.12
```

### Smart Installation

Smart installation automatically tries the best method and falls back to system package managers:

```bash
# Smart install with automatic fallback
launchpad smart-install node@22 python@3.12 go@1.23

# Use the shorthand
launchpad si node@22 python@3.12

# Smart install without fallback to system packages
launchpad smart-install --no-fallback node

# Smart install with verbose output
launchpad smart-install --verbose node@22 python@3.12
```

The smart installer:
1. First tries to install using pkgx
2. If pkgx fails and fallback is enabled, tries system package managers:
   - **macOS**: Uses Homebrew (`brew install`)
   - **Linux**: Uses apt (Ubuntu/Debian) or yum (RHEL/CentOS)
3. Provides manual installation instructions if all methods fail
4. Checks if packages are already installed to avoid duplicates

### Package-Specific Installation

Launchpad provides dedicated commands for specific tools:

#### Bun Installation

Install Bun directly from official GitHub releases:

```bash
# Install latest version of Bun
launchpad bun

# Install a specific version
launchpad bun --version 1.2.14

# Customize installation path
launchpad bun --path ~/my-bin

# Force reinstallation
launchpad bun --force
```

This command:
1. Automatically detects your platform and architecture
2. Downloads the appropriate Bun binary from GitHub releases
3. Installs it to the specified path
4. Adds the installation directory to your PATH (if needed)

Unlike the general `install` command, `launchpad bun` doesn't require pkgx as it downloads directly from GitHub.

#### Zsh Installation

Install the Zsh shell:

```bash
# Install zsh
launchpad zsh

# Customize installation path
launchpad zsh --path ~/my-bin

# Force reinstallation
launchpad zsh --force

# Install without automatically adding to PATH
launchpad zsh --no-auto-path
```

This command:
1. Ensures pkgx is installed first
2. Uses pkgx to install the latest version of zsh
3. Adds the installation directory to your PATH (if enabled)
4. Provides instructions for making zsh your default shell

After installation, you can make zsh your default shell:

```bash
# Using the installed zsh
chsh -s /path/to/installed/zsh

# Or using system zsh (if available)
chsh -s /bin/zsh
```

## How Package Installation Works

When you run an installation command, Launchpad:

1. Checks if pkgx is installed (and installs it automatically if needed)
2. Utilizes `ts-pkgx` to match against available packages in the Pantry
3. Creates the necessary installation directories
4. Installs the package using pkgx
5. Creates shims and symlinks for executables
6. Optionally adds installation paths to your PATH

## Installation Location

By default, packages are installed to:
- `/usr/local` if it's writable by the current user
- `~/.local` as a fallback location

You can specify a custom installation path:

```bash
launchpad install --path ~/my-packages node
launchpad smart-install --path ~/my-packages node python
```

## Version Control

Launchpad can install specific versions of packages:

```bash
# Install a specific version
launchpad install node@22
launchpad smart-install node@24
```

## Force Reinstallation

If a package is already installed, Launchpad will skip it by default. You can force reinstallation:

```bash
launchpad install --force node
launchpad smart-install --force node
launchpad bun --force
```

## Verbose Mode

For debugging or to see detailed installation information:

```bash
launchpad install --verbose node
launchpad smart-install --verbose node@22 python@3.12
launchpad bun --verbose
```

## Configuration Options

Launchpad handles network issues and retries automatically:

- **Default retries**: 3 attempts
- **Default timeout**: 60 seconds (60000ms)
- **Auto-sudo**: Enabled by default for system installations
- **Auto-add to PATH**: Enabled by default

You can customize these in the configuration:

```typescript
{
  "maxRetries": 5,
  "timeout": 120000,
  "autoSudo": false,
  "autoAddToPath": false
}
```

## Package Listing

You can see all installed packages:

```bash
launchpad list
# or
launchpad ls
```

The output shows each package name and its version.

## Uninstalling Packages

Remove installed packages:

```bash
launchpad uninstall node
# or
launchpad rm node
```

Note: The `uninstall` command is available in the core module but not exposed in the current CLI. You can access it through the programmatic API.
