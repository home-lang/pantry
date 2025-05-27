<p align="center"><img src="https://github.com/stacksjs/launchpad/blob/main/.github/art/cover.jpg?raw=true" alt="Social Card of Launchpad"></p>

# Introduction

> A lightweight package manager built on top of pkgx to simplify package installation and management.

## What is Launchpad?

Launchpad serves as an alternative to package managers like Homebrew, focusing on:

- A consistent and simple CLI interface
- Automatic PATH management
- Easy installation of development tools
- Cross-platform support

At its core, Launchpad leverages pkgx, a next-generation package runner that allows you to use packages without installing them. Launchpad extends this functionality with convenient commands, better management of executables, and improved integration with your development workflow.

## Key Features

- 📦 **Package Management** — Install and manage packages directly using pkgx
- 🔄 **Executable Shims** — Create executable shims for packages automatically
- 🛠️ **pkgx Installation** — Install and manage the pkgx utility itself
- 💻 **Dev Environment** — Dedicated command for the dev package for development environments
- 🚀 **Bun Installation** — Install Bun runtime directly from GitHub releases
- 🐚 **Zsh Installation** — Install the Zsh shell with automatic PATH management
- 🔧 **Auto-updates** — Configure automatic updates for pkgx
- 🔌 **PATH Integration** — Automatically add installation directories to your PATH
- 🪟 **Cross-platform** — Support for macOS, Linux, and Windows systems

## How It Works

Launchpad works by managing the installation of pkgx and creating shims (executable scripts) that automatically run the correct versions of your tools. It can:

- Install pkgx itself without requiring another package manager
- Create shims for packages so they're available system-wide
- Configure automatic updates and PATH modifications
- Simplify the installation of the `dev` package for project-specific development environments

Whether you're setting up a new development machine, working on multiple projects with different tooling requirements, or just want a cleaner way to manage your packages, Launchpad offers a streamlined experience for modern developers.

## Quick Example

Here's a simple example of how to use Launchpad:

```bash
# Install Launchpad
bun add -g @stacksjs/launchpad

# Install Node.js
launchpad install node

# Install Zsh shell
launchpad zsh

# Create shims for Node.js
launchpad shim node

# Now 'node' and 'zsh' are available in your PATH
node --version
zsh --version
```

With just a few commands, you've installed Node.js and Zsh, making them available in your PATH. Launchpad handles all the complexity for you.

## Why Choose Launchpad?

Launchpad offers several advantages over traditional package managers:

- **Speed**: Installing packages is significantly faster
- **Isolation**: Changes to one package don't affect others
- **Simplicity**: Clean, consistent interface across platforms
- **Integration**: Automatic PATH management and environment configuration
- **Flexibility**: Works with project-specific development environments

## Next Steps

Ready to get started with Launchpad? Check out these guides:

- [Installation Guide](./install.md) — Install Launchpad on your system
- [Basic Usage](./usage.md) — Learn the basic commands
- [Configuration](./config.md) — Customize Launchpad to your needs
- [Why Launchpad?](./why.md) — More details on the advantages of Launchpad

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/launchpad/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

Two things are true: Stacks OSS will always stay open-source, and we do love to receive postcards from wherever Stacks is used! 🌍 _We also publish them on our website. And thank you, Spatie_

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## Credits

- [Max Howell](https://github.com/mxcl) - for creating [pkgx](https://github.com/pkgxdev/pkgx) and [Homebrew](https://github.com/Homebrew/brew)
- [pkgm](https://github.com/pkgxdev/pkgm) - for the initial inspiration
- [Chris Breuer](https://github.com/chrisbbreuer)
- [All Contributors](https://github.com/stacksjs/launchpad/graphs/contributors)

## License

The MIT License (MIT). Please see [LICENSE](https://github.com/stacksjs/launchpad/tree/main/LICENSE.md) for more information.

Made with 💙

<!-- Badges -->

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/rpx/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/rpx -->
