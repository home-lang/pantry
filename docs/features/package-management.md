# Package Management

One of the core features of Launchpad is its ability to manage packages through the `install` command, which leverages pkgx under the hood.

## Installation Basics

Installing packages with Launchpad is straightforward:

```bash
# Install a single package
launchpad install node

# Install multiple packages at once
launchpad install python ruby go
```

## How Package Installation Works

When you run an installation command, Launchpad:

1. Checks if pkgx is installed (and installs it if needed)
2. Queries pkgx for the package information
3. Creates the necessary installation directories
4. Installs the package using pkgx
5. Optionally creates shims for executables

## Installation Location

By default, packages are installed to:
- `/usr/local` if it's writable by the current user
- `~/.local` as a fallback location

You can specify a custom installation path:

```bash
launchpad install --path ~/my-packages node
```

## Handling Permissions

When installing to system directories like `/usr/local`, you might need elevated permissions. Launchpad provides two options:

1. **Auto-sudo mode** (enabled by default):
   ```bash
   # Launchpad will automatically use sudo if needed
   launchpad install node
   ```

2. **Manual sudo mode**:
   ```bash
   # Explicitly use sudo
   sudo launchpad install node

   # Or disable auto-sudo and specify when needed
   launchpad install --sudo node
   ```

You can disable auto-sudo in the configuration:

```json
{
  "autoSudo": false
}
```

## Version Control

Launchpad can install specific versions of packages:

```bash
# Install a specific version
launchpad install node@16
```

## Force Reinstallation

If a package is already installed, Launchpad will skip it by default. You can force reinstallation:

```bash
launchpad install --force node
```

## Retries and Timeouts

Launchpad handles network issues with automatic retries:

- Default retries: 3 attempts
- Default timeout: 60 seconds (60000ms)

You can customize these in the configuration:

```json
{
  "maxRetries": 5,
  "timeout": 120000
}
```

## Verbose Mode

For debugging or to see detailed installation information:

```bash
launchpad install --verbose node
```

## Bun Installation

Launchpad provides a dedicated command for installing Bun directly from official GitHub releases:

```bash
# Install latest version of Bun
launchpad bun

# Install a specific version
launchpad bun --version 1.2.3

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

## Zsh Installation

Launchpad provides a dedicated command for installing the Zsh shell:

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

## Listing Installed Packages

You can see all installed packages:

```bash
launchpad list
# or
launchpad ls
```

The output shows each package name and its version.
