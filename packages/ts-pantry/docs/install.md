# Installation

Installing ts-pkgx is easy. Simply pull it in via your package manager of choice.

## Package Managers

Choose your package manager of choice:

::: code-group

```sh [npm]
npm install ts-pkgx
# npm i ts-pkgx

# Or, as a development dependency
npm install --save-dev ts-pkgx
```

```sh [bun]
bun install ts-pkgx
# bun add ts-pkgx

# Or, as a development dependency
bun install --dev ts-pkgx
```

```sh [pnpm]
pnpm add ts-pkgx
# pnpm i ts-pkgx

# Or, as a development dependency
pnpm add --save-dev ts-pkgx
```

```sh [yarn]
yarn add ts-pkgx
# yarn i ts-pkgx

# Or, as a development dependency
yarn add --dev ts-pkgx
```

:::

## Global Installation

If you want to use the CLI globally, you can install it globally:

::: code-group

```sh [npm]
npm install -g ts-pkgx
```

```sh [bun]
bun install -g ts-pkgx
```

```sh [pnpm]
pnpm add -g ts-pkgx
```

```sh [yarn]
yarn global add ts-pkgx
```

:::

## Using Pre-compiled Binaries

ts-pkgx also provides pre-compiled binaries for various platforms. These allow you to use the CLI without needing to install Node.js or Bun:

```sh
# Download the binary for your platform
curl -fsSL https://github.com/stacksjs/ts-pkgx/releases/latest/download/ts-pkgx-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m).zip -o ts-pkgx.zip

# Unzip the binary
unzip ts-pkgx.zip

# Make it executable
chmod +x ts-pkgx

# Move to a directory in your PATH (optional)
sudo mv ts-pkgx /usr/local/bin/
```

## Verification

To verify the installation, you can run:

```sh
bun run pkgx:fetch node
```

Or if you installed globally or are using the binary:

```sh
ts-pkgx fetch node
```

This should fetch information about the Node.js package from pkgx.dev.

## Requirements

ts-pkgx requires:

- Bun runtime

## Next Steps

Once you have ts-pkgx installed, check out the [Usage](./usage.md) guide to learn how to use it.
