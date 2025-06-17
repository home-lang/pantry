# Installation

Installing `@stacksjs/launchpad` is easy. You can install it using your package manager of choice, or build it from source.

## Package Managers

Choose your preferred package manager:

::: code-group

```sh [npm]
# Install globally
npm install -g @stacksjs/launchpad

# Or install as a development dependency
npm install --save-dev @stacksjs/launchpad
```

```sh [bun]
# Install globally
bun add -g @stacksjs/launchpad

# Or install as a development dependency
bun add -d @stacksjs/launchpad
```

```sh [pnpm]
# Install globally
pnpm add -g @stacksjs/launchpad

# Or install as a development dependency
pnpm add -D @stacksjs/launchpad
```

```sh [yarn]
# Install globally
yarn global add @stacksjs/launchpad

# Or install as a development dependency
yarn add -D @stacksjs/launchpad
```

:::

## First-Time Setup

Launchpad is designed to "just work" right out of the box! When you run Launchpad for the first time, it will automatically detect what's missing and offer to set everything up.

### Automatic Bootstrap

Just run any launchpad command and it will offer to bootstrap automatically:

```sh
# Any command will trigger the welcome screen if needed
launchpad list
# → Shows welcome message and offers to install pkgx, configure PATH, and set up shell integration

# Or manually run the complete setup
launchpad bootstrap
```

### Manual Bootstrap

For more control over the setup process:

```sh
# Install everything you need in one command (defaults to /usr/local)
launchpad bootstrap

# Verbose output showing all operations
launchpad bootstrap --verbose

# Skip specific components
launchpad bootstrap --skip-bun --skip-shell-integration

# Custom installation path (override default /usr/local)
launchpad bootstrap --path ~/.local

# Force reinstall everything
launchpad bootstrap --force
```

The bootstrap command will:

- ✅ Install Bun (JavaScript runtime)
- ✅ Configure your PATH
- ✅ Set up shell integration for auto-activation
- ✅ Provide clear next steps

## From Source

To build and install from source:

```sh
# Clone the repository
git clone https://github.com/stacksjs/launchpad.git
cd launchpad

# Install dependencies
bun install

# Build the project
bun run build

# Link for global usage
bun link

# Or use the compiled binary directly
./packages/launchpad/bin/launchpad
```

## Dependencies

Launchpad requires the following:

- Node.js 16+ or Bun 1.0+
- pkgx (will be automatically installed if not present)

## Verifying Installation

After installation, you can verify that launchpad is installed correctly by running:

```sh
launchpad version
```

You should see the current version of launchpad displayed in your terminal.

## Post-Installation

### Shell Integration

If you didn't use the bootstrap command, you can manually set up shell integration:

```sh
# Add shell integration to your shell config
echo 'eval "$(launchpad dev:shellcode)"' >> ~/.zshrc

# Or for bash
echo 'eval "$(launchpad dev:shellcode)"' >> ~/.bashrc

# Reload your shell
source ~/.zshrc  # or ~/.bashrc
```

### PATH Configuration

Ensure the installation directories are in your PATH:

```sh
# Check if launchpad directories are in PATH
echo $PATH | grep -E "(\.local/bin|\.local/sbin)"

# If not, the bootstrap command will add them automatically
launchpad bootstrap
```

## Uninstalling

If you need to completely remove Launchpad:

```sh
# Remove everything (with confirmation)
launchpad uninstall

# Preview what would be removed
launchpad uninstall --dry-run

# Force removal without prompts
launchpad uninstall --force

# Keep packages but remove shell integration
launchpad uninstall --keep-packages
```

## Next Steps

After installation, you might want to:

- [Configure launchpad](/config) to customize your setup
- [Learn about basic usage](/usage) to start managing packages
- [Set up package management](/features/package-management) for your development workflow
