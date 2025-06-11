# Basic Usage

Launchpad provides a simple yet powerful command-line interface for managing packages and development environments. This guide covers the most common operations.

## Command Overview

Here are the main commands available in Launchpad:

| Command | Description |
|---------|-------------|
| `install` or `i` | Install packages |
| `remove` | Remove specific packages |
| `shim` | Create shims for packages |
| `pkgx` | Install pkgx itself |
| `dev:on` | Activate dev environment in directory |
| `dev:dump` | Generate environment setup script for a project |
| `dev:shellcode` | Generate shell integration code |
| `bun` | Install Bun runtime directly |
| `zsh` | Install Zsh shell |
| `smart-install` | Smart install with automatic fallback to system package managers |
| `bootstrap` | Install all essential tools at once |
| `list` | List installed packages |
| `uninstall` | Complete removal of Launchpad and all packages |
| `env:list` | List all development environments |
| `env:clean` | Clean up unused development environments |
| `env:inspect` | Inspect a specific development environment |
| `env:remove` | Remove a specific development environment |
| `env:update` | Update package versions in dependencies.yaml |
| `autoupdate` | Check auto-update status |
| `autoupdate:enable` | Enable auto-updates |
| `autoupdate:disable` | Disable auto-updates |
| `version` | Show version information |
| `help` | Display help information |

## Installing Packages

Install one or more packages using the `install` or `i` command:

```bash
# Install a single package (defaults to /usr/local for system-wide)
launchpad install node@22

# Install multiple packages
launchpad install python@3.12 ruby@3.3

# Short form
launchpad i go

# Install to a specific location
launchpad install --path ~/my-packages node
```

### Installation Locations

Launchpad follows the pkgm philosophy for installation paths, **never installing to Homebrew's directories**:

- **System-wide installation** (default): `/usr/local` - Used when you have write permissions
- **User-specific installation**: `~/.local` - Used automatically when `/usr/local` is not writable
- **Custom path**: Use `--path <path>` to specify any installation directory

> **Important**: Launchpad follows the pkgm approach and **never installs to `/opt/homebrew`** (Homebrew's directory). This ensures clean separation from Homebrew-managed packages and follows the traditional Unix philosophy of using `/usr/local` for system-wide installations.

```bash
# Examples of different installation methods
launchpad install node                    # Installs to /usr/local (default if writable)
launchpad install node --path /opt/tools  # Custom directory
launchpad install node --path ~/.local    # Force user directory
```

**Permission Handling**: When installing to `/usr/local` without sufficient permissions, Launchpad will:
- Detect the permission issue
- Prompt you interactively (if in a terminal)
- Offer to re-run with `sudo` automatically
- Fall back to `~/.local` if you decline sudo

## Smart Installation

Launchpad provides smart installation that automatically falls back to system package managers when needed:

```bash
# Smart install with automatic fallback
launchpad smart-install node python git

# If pkgx fails, automatically tries system package managers:
# - macOS: Homebrew
# - Ubuntu/Debian: apt
# - RHEL/CentOS/Fedora: yum/dnf
# - Arch: pacman
```

## Removing Packages

Remove specific packages while keeping the rest of your Launchpad setup intact:

```bash
# Remove a single package
launchpad remove python

# Remove multiple packages
launchpad remove node python ruby

# Remove a specific version
launchpad remove node@22

# Preview what would be removed without actually removing it
launchpad remove python --dry-run

# Remove without confirmation prompts
launchpad remove python --force

# Remove with verbose output showing all files
launchpad remove python --verbose
```

The `remove` command intelligently finds and removes:
- Binaries from `bin/` and `sbin/` directories
- Package-specific directories
- Associated shims
- Symlinks pointing to the package

## Development Environment Management

Launchpad provides powerful project-specific environment management with automatic activation and comprehensive management tools.

### Auto-Activation with Shell Integration

Set up shell integration to automatically activate environments when entering project directories:

```bash
# Add to your shell configuration
echo 'eval "$(launchpad dev:shellcode)"' >> ~/.zshrc

# Reload your shell
source ~/.zshrc
```

Once set up, environments automatically activate when you enter a directory with dependency files:

```bash
cd my-project/  # → Automatically activates environment
# ✅ Environment activated for /path/to/my-project
cd ../          # → Automatically deactivates
# dev environment deactivated
```

### Manual Environment Commands

```bash
# Activate dev environment for current directory
launchpad dev:on

# Activate dev environment for specific directory
launchpad dev:on /path/to/project

# Generate environment script for current directory
launchpad dev:dump

# Generate environment script for specific directory
launchpad dev:dump /path/to/project

# Preview packages without generating script
launchpad dev:dump --dryrun

# Generate script with verbose output
launchpad dev:dump --verbose
```

### Customizing Shell Messages

You can customize or disable the shell activation/deactivation messages:

```bash
# Disable all messages
export LAUNCHPAD_SHOW_ENV_MESSAGES=false

# Custom activation message (use {path} for project path)
export LAUNCHPAD_SHELL_ACTIVATION_MESSAGE="🚀 Development environment ready: {path}"

# Custom deactivation message
export LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE="👋 Environment deactivated"
```

Or configure in your `launchpad.config.ts`:

```ts
export default {
  showShellMessages: true,
  shellActivationMessage: '🔧 Environment loaded for {path}',
  shellDeactivationMessage: '🔒 Environment closed'
}
```

### Project-Specific Dependencies

Create a `dependencies.yaml` file in your project:

```yaml
dependencies:
  - node@22
  - python@3.12
  - gnu.org/wget@1.21

env:
  NODE_ENV: development
  PROJECT_NAME: my-awesome-project
```

Supported dependency file formats:
- `dependencies.yaml` / `dependencies.yml`
- `pkgx.yaml` / `pkgx.yml`
- `.pkgx.yaml` / `.pkgx.yml`
- `.launchpad.yaml` / `launchpad.yaml`
- `.launchpad.yml` / `launchpad.yml`
- `deps.yml` / `deps.yaml`
- `.deps.yml` / `.deps.yaml`

### Environment Isolation

Each project gets its own isolated environment:
- Project-specific installation directory: `~/.local/share/launchpad/envs/{project-hash}/`
- Isolated PATH and environment variables
- Binary stubs with environment isolation
- Automatic cleanup when leaving project directory

## Environment Management

Launchpad provides comprehensive tools for managing development environments with human-readable identifiers.

### Listing Environments

View all your development environments:

```bash
# List all environments in a table format
launchpad env:list

# Show detailed information including hashes
launchpad env:list --verbose

# Output as JSON for scripting
launchpad env:list --format json

# Simple format for quick overview
launchpad env:list --format simple
```

**Example Output:**
```
📦 Development Environments:

│ Project         │ Packages │ Binaries │ Size     │ Created      │
├───────────────────────────────────────────────────────────────┤
│ final-project   │ 2        │ 2        │ 5.0M     │ 5/30/2025    │
│ working-test    │ 3        │ 20       │ 324M     │ 5/30/2025    │
│ dummy           │ 1        │ 1        │ 1.1M     │ 5/30/2025    │
└───────────────────────────────────────────────────────────────┘

Total: 3 environment(s)
```

### Inspecting Environments

Get detailed information about a specific environment:

```bash
# Basic inspection
launchpad env:inspect working-test_208a31ec

# Detailed inspection with directory structure
launchpad env:inspect final-project_7db6cf06 --verbose

# Show binary stub contents
launchpad env:inspect dummy_6d7cf1d6 --show-stubs
```

### Cleaning Up Environments

Automatically clean up unused or failed environments:

```bash
# Preview what would be cleaned
launchpad env:clean --dry-run

# Clean environments older than 30 days (default)
launchpad env:clean

# Clean environments older than 7 days
launchpad env:clean --older-than 7

# Force cleanup without confirmation
launchpad env:clean --force

# Verbose cleanup with details
launchpad env:clean --verbose
```

### Removing Specific Environments

Remove individual environments by their hash:

```bash
# Remove with confirmation
launchpad env:remove dummy_6d7cf1d6

# Force removal without confirmation
launchpad env:remove minimal_3a5dc15d --force

# Verbose removal showing details
launchpad env:remove working-test_208a31ec --verbose
```

### Environment Hash Format

Launchpad uses human-readable hash identifiers for environments:

**Format:** `{project-name}_{8-char-hex-hash}`

**Examples:**
- `final-project_7db6cf06` - Environment for "final-project"
- `working-test_208a31ec` - Environment for "working-test"
- `my-app_1a2b3c4d` - Environment for "my-app"

## Updating Dependencies

### Automatic Updates

Keep your dependencies up to date with the `env:update` command:

```bash
# Check for available updates
launchpad env:update --check-only

# Preview what would be updated
launchpad env:update --dry-run

# Apply updates interactively
launchpad env:update

# Apply updates without confirmation
launchpad env:update --force
```

The update command:
- **Checks latest versions** from pkgx and GitHub (for Bun)
- **Preserves version constraints** (^, ~, >=, etc.)
- **Shows clear diff** of what will change
- **Supports dry-run mode** for safe previewing
- **Updates dependencies.yaml** automatically

## Bootstrap Setup

For first-time setup or fresh installations, use the bootstrap command:

### Quick Setup

Get everything you need with one command:

```bash
# Install all essential tools (defaults to /usr/local if writable, ~/.local otherwise)
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

# Custom installation path (override default /usr/local)
launchpad bootstrap --path ~/.local

# Disable automatic PATH modification
launchpad bootstrap --no-auto-path
```

## Complete System Cleanup

For complete removal of Launchpad and all installed packages:

```bash
# Remove everything with confirmation
launchpad uninstall

# Preview what would be removed
launchpad uninstall --dry-run

# Remove everything without prompts
launchpad uninstall --force

# Remove only packages but keep shell integration
launchpad uninstall --keep-packages
```

The `uninstall` command removes:
- All installed packages and their files
- Installation directories (`bin/`, `sbin/`, `pkgs/`)
- Shell integration from `.zshrc`, `.bashrc`, etc.
- Shim directories
- Project-specific environment directories
- Provides guidance for manual PATH cleanup

## Creating Shims

Shims are lightweight executable scripts that point to the actual binaries. They allow you to run commands without having to modify your PATH for each package:

```bash
# Create shims for a package
launchpad shim node

# Create shims with a custom path
launchpad shim --path ~/bin typescript

# Create shims without auto-adding to PATH
launchpad shim node --no-auto-path
```

## Installing pkgx

If you don't have pkgx installed, Launchpad can install it for you:

```bash
# Install pkgx (to /usr/local if writable, ~/.local otherwise)
launchpad pkgx

# Force reinstall
launchpad pkgx --force

# Install to specific path
launchpad pkgx --path ~/bin
```

## Installing Bun

Launchpad provides a dedicated command for installing Bun directly from GitHub releases:

```bash
# Install latest Bun version
launchpad bun

# Install specific version
launchpad bun --version 1.0.0

# Specify installation path
launchpad bun --path ~/bin
```

The `bun` command automatically detects your platform, downloads the appropriate binary, and adds it to your PATH.

## Installing Zsh

Launchpad provides a dedicated command for installing the Zsh shell:

```bash
# Install zsh
launchpad zsh

# Force reinstall
launchpad zsh --force

# Specify installation path
launchpad zsh --path ~/bin
```

After installation, Launchpad provides instructions for making zsh your default shell:

```bash
# Make zsh your default shell
chsh -s /path/to/installed/zsh
```

## Managing Auto-updates

Control how pkgx handles updates:

```bash
# Check current auto-update status
launchpad autoupdate

# Enable auto-updates
launchpad autoupdate:enable

# Disable auto-updates
launchpad autoupdate:disable
```

## Listing Installed Packages

View what packages are currently installed:

```bash
# List all installed packages
launchpad list
```

## Common Options

Most commands support these options:

| Option | Description |
|--------|-------------|
| `--verbose` | Enable detailed logging |
| `--path` | Specify installation/shim path |
| `--force` | Force reinstall/removal even if already installed/not found |
| `--dry-run` | Preview changes without actually performing them |
| `--no-auto-path` | Don't automatically add to PATH |
| `--sudo` | Use sudo for installation (if needed) |
| `--quiet` | Suppress status messages |

## Package Management Best Practices

### Understanding Installation Philosophy

Launchpad follows the pkgm approach:
- **Never uses Homebrew directories** (`/opt/homebrew`)
- **Prefers `/usr/local`** for system-wide installations (traditional Unix approach)
- **Falls back to `~/.local`** for user-specific installations when needed
- **Maintains clean separation** from other package managers

### Using Environment Isolation

Launchpad automatically provides environment isolation for each project:

```bash
# Each project gets its own environment
cd project-a/    # → Uses node@20, python@3.11
cd ../project-b/ # → Uses node@22, python@3.12
```

### Choosing Between Remove and Uninstall

- Use `remove` when you want to uninstall specific packages while keeping your Launchpad setup
- Use `uninstall` when you want to completely remove Launchpad and start fresh

### Using Dry-Run Mode

Always preview major changes before executing them:

```bash
# Preview package removal
launchpad remove python --dry-run

# Preview complete system cleanup
launchpad uninstall --dry-run

# Preview environment setup
launchpad dev:dump --dryrun
```

### Version Management

Remove specific versions while keeping others:

```bash
# List installed packages to see versions
launchpad list

# Remove only a specific version
launchpad remove node@20

# Keep node@22 installed
```

## Using PATH Integration

By default, Launchpad automatically adds shim directories to your PATH. You can disable this behavior:

```bash
launchpad shim node --no-auto-path
```

## Working with Dependencies

### Dependency File Formats

Launchpad supports multiple dependency file formats:

```yaml
# dependencies.yaml
dependencies:
  - node@22
  - python@3.12

env:
  NODE_ENV: development
  API_URL: https://api.example.com
```

### Environment Variables

Set project-specific environment variables:

```yaml
dependencies:
  - node@22

env:
  NODE_ENV: production
  DATABASE_URL: postgresql://localhost/myapp
  API_KEY: your-api-key-here
```

### Complex Dependencies

Handle complex package specifications:

```yaml
dependencies:
  - gnu.org/wget@^1.21
  - curl.se@~8.0
  - python.org@>=3.11

env:
  PATH_EXTENSION: /custom/bin
  PYTHON_PATH: /opt/custom/python
```

## Getting Help

For detailed information about any command:

```bash
launchpad help
launchpad <command> --help
```

## Troubleshooting

### Environment Not Activating

If automatic environment activation isn't working:

1. Ensure shell integration is set up:
   ```bash
   echo 'eval "$(launchpad dev:shellcode)"' >> ~/.zshrc
   source ~/.zshrc
   ```

2. Check for dependency files in your project directory
3. Verify the dependency file syntax is correct

### Package Installation Failures

If packages fail to install:

1. Check your internet connection
2. Verify the package name and version exist
3. Try with verbose output: `launchpad install --verbose package-name`
4. Check if you have write permissions to the installation directory

### Permission Issues

If you encounter permission errors:

1. Launchpad will automatically prompt for sudo when installing to `/usr/local`
2. Install to user directory: `--path ~/.local`
3. Check directory permissions

### Shell Integration Issues

If shell integration isn't working:

1. Verify your shell is supported (bash or zsh)
2. Check that the shell integration code was added correctly
3. Reload your shell configuration
4. Try generating new shell code: `launchpad dev:shellcode`
5. Check if shell messages are disabled: `echo $LAUNCHPAD_SHOW_ENV_MESSAGES`

### Shell Message Issues

If you're not seeing environment messages:

1. Check if messages are disabled:
   ```bash
   echo $LAUNCHPAD_SHOW_ENV_MESSAGES
   ```

2. Re-enable messages:
   ```bash
   export LAUNCHPAD_SHOW_ENV_MESSAGES=true
   ```

3. Check your configuration file for `showShellMessages: false`
