# Bun Installation

Launchpad provides a dedicated command to install Bun directly from the official GitHub releases. This feature allows you to easily set up Bun in your environment without requiring pkgx or other package managers.

## Basic Usage

To install the latest version of Bun:

```bash
launchpad bun
```

## Command Options

The `bun` command accepts the following options:

| Option | Description |
|--------|-------------|
| `--version <version>` | Install a specific version of Bun |
| `--path <path>` | Specify installation path (default is your system's standard installation location) |
| `--verbose` | Enable detailed logging |
| `--force` | Force reinstall even if Bun is already installed |
| `--no-auto-path` | Do not automatically add to PATH |

## Examples

### Install a specific version

```bash
launchpad bun --version 1.2.3
```

### Install to a custom location

```bash
launchpad bun --path ~/my-tools
```

### Force reinstallation

```bash
launchpad bun --force
```

## How it Works

The Bun installation feature:

1. **Platform detection**: Automatically detects your operating system and architecture
2. **Version resolution**: Fetches the latest version from GitHub (or uses the specified version)
3. **Download**: Retrieves the appropriate binary from GitHub releases
4. **Installation**: Extracts and installs the binary to the specified location
5. **PATH integration**: Adds the installation directory to your PATH if it's not already included

## Supported Platforms

Bun installation works on:

- macOS (both Intel and Apple Silicon)
- Linux (x64 and ARM64)
- Windows (x64)

Each platform automatically gets the correct binary for its architecture.

## Advantages Over Manual Installation

Using Launchpad to install Bun offers several advantages:

1. **Simplified command**: One command handles the entire installation process
2. **PATH management**: No need to manually add Bun to your PATH
3. **Version selection**: Easily install specific versions when needed
4. **Cross-platform support**: Same command works across all supported platforms
5. **Automatic updates**: Easily update to the latest version by running the command again with `--force`

## Troubleshooting

If you encounter issues during installation:

- Use the `--verbose` flag to see detailed output
- Check if you have permission to write to the installation directory
- Ensure your system architecture is supported
- Verify your internet connection (as the installer needs to download from GitHub)

If Bun is already installed but not accessible, you may need to restart your terminal or run the appropriate shell command to refresh your PATH:

```bash
# For bash
source ~/.bashrc

# For zsh
source ~/.zshrc
```
