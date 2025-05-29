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
- 🗑️ **Package Removal** — Remove specific packages or completely uninstall Launchpad
- 🔄 **Executable Shims** — Create executable shims for packages automatically
- 🌍 **Environment Isolation** — Project-specific environments with automatic activation/deactivation
- 🎯 **Bootstrap Setup** — One-command setup of essential development tooling
- 🔧 **Auto-updates** — Configure automatic updates for pkgx
- 🔌 **PATH Integration** — Automatically add installation directories to your PATH
- 🪟 **Cross-platform** — Support for macOS, Linux, and Windows systems
- 🔒 **Smart Installation** — Automatic fallback to system package managers when needed

## How It Works

Launchpad works by managing the installation of pkgx and creating shims (executable scripts) that automatically run the correct versions of your tools. It can:

- Figure out required system or project dependencies and install them
- Provide project-specific environment isolation with automatic dependency activation/deactiviation
- Configure automatic updates and PATH modifications

Whether you're setting up a new development machine, working on multiple projects with different tooling requirements, or just want a cleaner way to manage your packages, Launchpad offers a streamlined experience for modern developers with complete environment isolation.

## Quick Example

Here's a simple example of how to use Launchpad:

```bash
# Install Launchpad
bun add -g @stacksjs/launchpad

# Bootstrap everything you need at once
launchpad bootstrap

# Or install individual packages
launchpad install node@22

# Set up automatic environment activation
echo 'eval "$(launchpad dev:shellcode)"' >> ~/.zshrc
source ~/.zshrc

# Create a project with dependencies
mkdir my-project && cd my-project
cat > dependencies.yaml << EOF
dependencies:
  - node@22
  - python@3.12
env:
  NODE_ENV: development
  PROJECT_NAME: my-project
EOF

# Environment automatically activates when you enter the directory
# ✅ Environment activated for /path/to/my-project

# Install Zsh shell
launchpad zsh

# Create shims for Node.js
launchpad shim node

# Now 'node' and 'zsh' are available in your PATH
node --version
zsh --version

# Environment automatically deactivates when you leave
cd ..
# 🔄 dev environment deactivated

# Remove specific packages when no longer needed
launchpad remove node

# Or completely uninstall everything
launchpad uninstall
```

With just a few commands, you've set up a complete development environment with automatic project-specific isolation. Launchpad handles all the complexity for you, and you can easily clean up when you're done.

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
- [pkgm](https://github.com/pkgxdev/pkgm) & [dev](https://github.com/pkgxdev/dev) - for the initial project inspiration
- [Chris Breuer](https://github.com/chrisbbreuer)
- [All Contributors](https://github.com/stacksjs/launchpad/graphs/contributors)

## License

The MIT License (MIT). Please see [LICENSE](https://github.com/stacksjs/launchpad/tree/main/LICENSE.md) for more information.

Made with 💙

<!-- Badges -->

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/rpx/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/rpx -->
