# Installation

Installing `launchpad` is easy. You can install it using your package manager of choice, or build it from source.

## Package Managers

Choose your preferred package manager:

::: code-group

```sh [npm]
# Install globally
npm install -g launchpad

# Or install as a development dependency
npm install --save-dev launchpad
```

```sh [bun]
# Install globally
bun add -g launchpad

# Or install as a development dependency
bun add -d launchpad
```

```sh [pnpm]
# Install globally
pnpm add -g launchpad

# Or install as a development dependency
pnpm add -D launchpad
```

```sh [yarn]
# Install globally
yarn global add launchpad

# Or install as a development dependency
yarn add -D launchpad
```

:::

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

## Next Steps

After installation, you might want to:

- [Configure launchpad](/config) to customize your setup
- [Learn about basic usage](/usage) to start managing packages
- [Install pkgx](/features/pkgx-management) if it's not already installed
