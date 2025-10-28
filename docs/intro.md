<p align="center"><img src="https://github.com/stacksjs/pantry/blob/main/.github/art/cover.jpg?raw=true" alt="Social Card of pantry"></p>

# Introduction

> A lightweight package manager built on top of the pkgx Pantry to simplify package installation and management.

## What is pantry?

pantry serves as an alternative to package managers like Homebrew, focusing on:

- A consistent and simple CLI interface
- Automatic PATH management
- Easy installation of development tools
- Cross-platform support
- Clean separation from other package managers

At its core, pantry leverages the pkgx package registry through ts-pkgx, providing access to thousands of packages with convenient commands, better management of executables, and improved integration with your development workflow.

## Installation Philosophy

pantry follows the **pkgm approach** to package management:

- **Never installs to Homebrew directories** (`/opt/homebrew`) - maintains clean separation
- **Prefers `/usr/local`** for system-wide installations (traditional Unix philosophy)
- **Falls back to `~/.local`** for user-specific installations when needed
- **Respects existing system conventions** while avoiding conflicts with other package managers

This approach ensures that pantry can coexist peacefully with Homebrew, system package managers, and other tools without interfering with their operation.

## Key Features

- 📦 **Package Management** — Install and manage packages from the pkgx registry via ts-pkgx
- 🗑️ **Package Removal** — Remove specific packages or completely uninstall pantry
- 🔄 **Executable Shims** — Create executable shims for packages automatically
- 🌍 **Environment Isolation** — Project-specific environments with automatic activation/deactivation
- 🎯 **Bootstrap Setup** — One-command setup of essential development tooling
- 🔧 **Updates** — Keep packages up-to-date with built-in update commands
- 🔌 **PATH Integration** — Automatically add installation directories to your PATH
- 🪟 **Cross-platform** — Support for macOS, Linux, and Windows systems
- 🔒 **Smart Installation** — Automatic fallback to system package managers when needed
- 💬 **Customizable Messages** — Configure or disable shell environment messages
- 🔗 **Clean Integration** — Works alongside Homebrew and other package managers

## How It Works

pantry works by utilizing the pkgx package registry through ts-pkgx and creating shims (executable scripts) that automatically run the correct versions of your tools. It can:

- Figure out required system or project dependencies and install them
- Provide project-specific environment isolation with automatic dependency activation/deactiviation
- Configure PATH modifications and manage package updates

Whether you're setting up a new development machine, working on multiple projects with different tooling requirements, or just want a cleaner way to manage your packages, pantry offers a streamlined experience for modern developers with complete environment isolation.

## Quick Example

Here's a simple example of how to use pantry:

```bash
# Install pantry
bun add -g @stacksjs/pantry

# Bootstrap everything you need at once (installs to /usr/local if writable)
pantry bootstrap

# Or install individual packages
pantry install node@22

# Set up automatic environment activation
echo 'eval "$(pantry dev:shellcode)"' >> ~/.zshrc
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

# Customize environment messages (optional)
export pantry_SHELL_ACTIVATION_MESSAGE="🚀 Project environment ready: {path}"
export pantry_SHELL_DEACTIVATION_MESSAGE="👋 Environment closed"

# Install Zsh shell
pantry zsh

# Create shims for Node.js
pantry shim node

# Now 'node' and 'zsh' are available in your PATH
node --version
zsh --version

# Environment automatically deactivates when you leave
cd ..
# 👋 Environment closed

# Remove specific packages when no longer needed
pantry remove node

# Or completely uninstall everything
pantry uninstall
```

With just a few commands, you've set up a complete development environment with automatic project-specific isolation. pantry handles all the complexity for you, and you can easily clean up when you're done.

## Why Choose pantry?

pantry offers several advantages over traditional package managers:

- **Speed**: Installing packages is significantly faster
- **Isolation**: Changes to one package don't affect others
- **Simplicity**: Clean, consistent interface across platforms
- **Integration**: Automatic PATH management and environment configuration
- **Flexibility**: Works with project-specific development environments
- **Coexistence**: Peaceful coexistence with Homebrew and other package managers
- **Customization**: Configurable shell messages and behavior
- **Philosophy**: Follows traditional Unix conventions while avoiding conflicts

## Package Manager Coexistence

pantry is designed to work alongside other package managers:

```bash
# pantry installs to /usr/local (or ~/.local)
pantry install node@22

# Homebrew manages its own directory
brew install git

# System package manager handles OS packages
apt install curl  # or yum, dnf, etc.

# All can coexist without conflicts
```

This clean separation means you can:

- Use Homebrew for GUI applications and system tools
- Use pantry for development environments and project-specific tools
- Use system package managers for OS-level dependencies
- Switch between them without conflicts or interference

## Shell Message Customization

pantry provides flexible shell message customization:

```bash
# Disable all environment messages
export pantry_SHOW_ENV_MESSAGES=false

# Customize activation messages with project path
export pantry_SHELL_ACTIVATION_MESSAGE="🔧 Development environment: {path}"

# Customize deactivation messages
export pantry_SHELL_DEACTIVATION_MESSAGE="🔒 Environment closed"

# Or configure in pantry.config.ts
echo 'export default {
  showShellMessages: true,
  shellActivationMessage: "📁 Project: {path}",
  shellDeactivationMessage: "🏠 Global environment"
}' > pantry.config.ts
```

## Next Steps

Ready to get started with pantry? Check out these guides:

- [Installation Guide](./install.md) — Install pantry on your system
- [Basic Usage](./usage.md) — Learn the basic commands
- [Configuration](./config.md) — Customize pantry to your needs
- [Why pantry?](./why.md) — More details on the advantages of pantry

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/pantry/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

"Software that is free, but hopes for a postcard." We love receiving postcards from around the world showing where Stacks is being used! We showcase them on our website too.

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## Credits

- [Max Howell](https://github.com/mxcl) - for creating [pkgx](https://github.com/pkgxdev/pkgx) and [Homebrew](https://github.com/Homebrew/brew)
- [pkgm](https://github.com/pkgxdev/pkgm) & [dev](https://github.com/pkgxdev/dev) - for the initial project inspiration
- [Chris Breuer](https://github.com/chrisbbreuer)
- [All Contributors](https://github.com/stacksjs/pantry/graphs/contributors)

## License

The MIT License (MIT). Please see [LICENSE](https://github.com/stacksjs/pantry/tree/main/LICENSE.md) for more information.

Made with 💙

<!-- Badges -->

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/rpx/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/rpx -->
