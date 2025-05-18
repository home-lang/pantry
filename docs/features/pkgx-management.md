# pkgx Management

Launchpad provides dedicated commands for installing and managing pkgx itself, which is the underlying engine that powers package installation.

## Installing pkgx

If you don't have pkgx installed, Launchpad can install it for you:

```bash
launchpad pkgx
```

This will:
1. Check if pkgx is already installed
2. Download and install the latest version of pkgx if needed
3. Set it up in a location that's accessible in your PATH

## Installation Location

By default, pkgx is installed to:
- `/usr/local` if it's writable by the current user
- `~/.local` as a fallback location

You can specify a different installation location:

```bash
launchpad pkgx --path ~/apps
```

## Force Reinstallation

To reinstall or update pkgx even if it's already installed:

```bash
launchpad pkgx --force
```

## Auto-update Configuration

pkgx has its own auto-update mechanism. Launchpad provides commands to manage this feature:

Check current auto-update status:

```bash
launchpad autoupdate
```

Enable automatic updates:

```bash
launchpad autoupdate:enable
```

Disable automatic updates:

```bash
launchpad autoupdate:disable
```

## Handling Permissions

When installing to system directories like `/usr/local`, you might need elevated permissions:

```bash
# With auto-sudo enabled (default)
launchpad pkgx

# If auto-sudo is disabled
sudo launchpad pkgx

# Or explicitly use sudo
launchpad pkgx --sudo
```

## How pkgx Installation Works

When you run the pkgx installation command, Launchpad:

1. Checks if pkgx is already installed and not forced to reinstall
2. Creates the necessary installation directories
3. Downloads the pkgx installation script from `https://pkgx.sh`
4. Runs the installation script with the specified installation path
5. Verifies the installation

## Automatic Installation

You don't need to explicitly install pkgx before using other Launchpad commands. If pkgx is required for an operation but not found, Launchpad will install it automatically.

## pkgx Configuration

pkgx stores its configuration in `~/.config/pkgx/config.json`. Launchpad can modify this configuration through commands like `autoupdate:enable` and `autoupdate:disable`.

The configuration might look like:

```json
{
  "auto_update": true
}
```

## Troubleshooting

If you encounter issues with pkgx installation:

1. Try running with verbose logging:
   ```bash
   launchpad pkgx --verbose
   ```

2. Check if pkgx is properly installed:
   ```bash
   which pkgx
   pkgx --version
   ```

3. Reinstall pkgx:
   ```bash
   launchpad pkgx --force
   ```
