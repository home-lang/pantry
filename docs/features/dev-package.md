# Dev Package

Launchpad provides a dedicated command for installing and managing the `dev` package, which is a powerful tool for development environment management.

## What is the Dev Package?

The `dev` package is a developer-focused tool that allows you to:
- Create project-specific development environments
- Activate tools and dependencies only when needed
- Maintain consistent environments across projects

You can learn more about the `dev` package at [https://github.com/pkgxdev/dev](https://github.com/pkgxdev/dev).

## Installing Dev

Installing the `dev` package is as simple as:

```bash
launchpad dev
```

This command:
1. Checks if pkgx is installed (and installs it if needed)
2. Creates a shim for the `dev` command
3. Adds the shim directory to your PATH (if configured to do so)

## Installation Location

By default, the `dev` shim is installed to:
- `/usr/local/bin` if it's writable by the current user
- `~/.local/bin` as a fallback location

You can specify a different installation location:

```bash
launchpad dev --path ~/bin
```

## Force Reinstallation

To reinstall the `dev` package even if it's already installed:

```bash
launchpad dev --force
```

## PATH Management

For the `dev` shim to work, its directory must be in your PATH. Launchpad can automatically add the shim directory to your PATH:

```bash
# Launchpad will add the shim directory to your PATH (default behavior)
launchpad dev
```

If you don't want automatic PATH modifications:

```bash
launchpad dev --no-auto-path
```

## How Dev Works

The `dev` command leverages pkgx to create isolated, project-specific environments. When you run:

```bash
dev .
```

In a project directory, it:
1. Looks for a `package.json`, `dev.json`, or other configuration files
2. Sets up the proper environment with all required tools
3. Activates the environment for your current shell

## Implementation Details

When you install the `dev` package with Launchpad, it creates a simple shim script:

```sh
#!/bin/sh
exec pkgx -q dev "$@"
```

This shim tells your system to execute `pkgx -q dev` with any arguments you provide when you run the `dev` command.

## Benefits Over Direct Installation

Installing the `dev` package through Launchpad offers several advantages:

1. **Simplified Installation**: No need to manually install pkgx first
2. **PATH Management**: Automatic PATH updates for easier access
3. **Cross-platform Support**: Works on macOS, Linux, and Windows
4. **Consistent Interface**: Same command structure as other Launchpad commands

## Using Dev After Installation

After installing the `dev` package, you can use it to activate development environments:

```bash
# Navigate to your project
cd your-project

# Activate the development environment
dev .

# Run project commands
npm run dev
```

## Verifying Installation

You can verify that the `dev` package is correctly installed:

```bash
dev --version
```

This should display the version of the `dev` package that's installed.
