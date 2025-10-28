# Installation

Installing `@stacksjs/pantry` is easy. You can install it using your package manager of choice, or build it from source.

## Package Managers

Choose your preferred package manager:

::: code-group

```sh [npm]
# Install globally
npm install -g @stacksjs/pantry

# Or install as a development dependency
npm install --save-dev @stacksjs/pantry
```

```sh [bun]
# Install globally
bun add -g @stacksjs/pantry

# Or install as a development dependency
bun add -d @stacksjs/pantry
```

```sh [pnpm]
# Install globally
pnpm add -g @stacksjs/pantry

# Or install as a development dependency
pnpm add -D @stacksjs/pantry
```

```sh [yarn]
# Install globally
yarn global add @stacksjs/pantry

# Or install as a development dependency
yarn add -D @stacksjs/pantry
```

:::

## First-Time Setup

pantry is designed to "just work" right out of the box! When you run pantry for the first time, it will automatically detect what's missing and offer to set everything up.

### Automatic Bootstrap

Just run any pantry command and it will offer to bootstrap automatically:

```sh
# Any command will trigger the welcome screen if needed
pantry list
# → Shows welcome message and offers to install pkgx, configure PATH, and set up shell integration

# Or manually run the complete setup
pantry bootstrap
```

### Manual Bootstrap

For more control over the setup process:

```sh
# Install everything you need in one command (defaults to /usr/local)
pantry bootstrap

# Verbose output showing all operations
pantry bootstrap --verbose

# Skip specific components
pantry bootstrap --skip-bun --skip-shell-integration

# Custom installation path (override default /usr/local)
pantry bootstrap --path ~/.local

# Force reinstall everything
pantry bootstrap --force
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
git clone https://github.com/stacksjs/pantry.git
cd pantry

# Install dependencies
bun install

# Build the project
bun run build

# Link for global usage
bun link

# Or use the compiled binary directly
./packages/pantry/bin/pantry
```

## Dependencies

pantry requires the following:

- Node.js 16+ or Bun 1.0+
- pkgx (will be automatically installed if not present)

## Verifying Installation

After installation, you can verify that pantry is installed correctly by running:

```sh
pantry version
```

You should see the current version of pantry displayed in your terminal.

## Post-Installation

### Shell Integration

If you didn't use the bootstrap command, you can manually set up shell integration:

```sh
# Add shell integration to your shell config
echo 'eval "$(pantry dev:shellcode)"' >> ~/.zshrc

# Or for bash
echo 'eval "$(pantry dev:shellcode)"' >> ~/.bashrc

# Reload your shell
source ~/.zshrc  # or ~/.bashrc
```

### PATH Configuration

Ensure the installation directories are in your PATH:

```sh
# Check if pantry directories are in PATH
echo $PATH | grep -E "(\.local/bin|\.local/sbin)"

# If not, the bootstrap command will add them automatically
pantry bootstrap
```

## Uninstalling

If you need to completely remove pantry:

```sh
# Remove everything (with confirmation)
pantry uninstall

# Preview what would be removed
pantry uninstall --dry-run

# Force removal without prompts
pantry uninstall --force

# Keep packages but remove shell integration
pantry uninstall --keep-packages
```

## Next Steps

After installation, you might want to:

- [Configure pantry](/config) to customize your setup
- [Learn about basic usage](/usage) to start managing packages
- [Set up package management](/features/package-management) for your development workflow
