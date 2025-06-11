# Why Launchpad?

## The Problem

Package management on modern systems can be frustrating for several reasons:

1. **Slow installations**: Homebrew and similar tools often take a long time to install or update packages
2. **Dependency chains**: Updating one package can trigger updates of many unrelated dependencies
3. **Environment conflicts**: Different projects may require different tool versions
4. **PATH management**: Keeping track of where executables are installed and ensuring they're in your PATH
5. **Cross-platform inconsistency**: Different solutions for different operating systems

## The Solution

Launchpad is a CLI and TypeScript library designed to solve these problems by providing:

- **Fast installations**: Leveraging the power of pkgx for efficient package management
- **Flexible installation locations**: Support for system-wide (`/usr/local`) and user-local (`~/.local`) installations
- **Isolated packages**: Install only what you need without affecting other dependencies
- **Automatic PATH management**: Easily access installed tools from anywhere
- **Consistent interface**: Same commands work across macOS, Linux, and Windows
- **Dev environments**: Dedicated support for project-specific development environments

## Key Advantages

### Compared to Homebrew

- **Speed**: Significantly faster installations without the overhead of checking the entire dependency tree
- **Isolation**: Changes to one package don't affect others
- **No formulas**: Access thousands of packages without needing custom formulas
- **Less disk space**: Only install what you need

### Compared to Manual Installation

- **Simplicity**: Single command to install complex tools
- **PATH management**: No need to manually edit shell config files
- **Version control**: Easily install specific versions of tools
- **Consistency**: Same experience across all platforms

## Real-world Use Cases

- **Developer onboarding**: Quickly set up new development machines with system-wide or user-specific tooling
- **System administration**: Install tools system-wide for all users (defaults to `/usr/local`)
- **CI/CD pipelines**: Efficiently install required tools in automation environments
- **Cross-team collaboration**: Ensure everyone has the same development environment
- **Project isolation**: Use different tool versions for different projects

## The Developer Experience

Launchpad is built with the developer experience in mind. It provides a clean, intuitive interface for managing packages and development environments, with sensible defaults that Just Work™ while still offering flexibility for advanced use cases.

```bash
# Install Node.js in seconds
launchpad install node@22

# Create a dedicated environment for a project
launchpad dev:on

# Manage pkgx itself
launchpad pkgx
```

## Why Now?

As software development becomes increasingly complex, the tools we use to manage our environments should become simpler. Launchpad represents a modern approach to package management that embraces isolation, speed, and cross-platform compatibility. This software is by the team that created Stacks.js, and in order to automated the onboarding process, we needed a better package manager.

By building on top of pkgx and focusing on the developer experience, Launchpad provides a powerful yet intuitive solution for managing packages and development environments in a way that's sustainable for the future of software development.
