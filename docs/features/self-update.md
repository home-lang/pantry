# Self-Update

Pantry can update itself to the latest version directly from the command line.

## Usage

```bash
# Upgrade to the latest stable release
pantry upgrade

# Upgrade to the latest canary (pre-release) build
pantry upgrade --canary

# Check what would be upgraded without making changes
pantry upgrade --dry-run

# Show detailed output including download URLs
pantry upgrade --verbose
```

## How It Works

1. Queries the [GitHub Releases API](https://github.com/home-lang/pantry/releases) for the latest version
2. Compares against your currently installed version
3. Downloads the platform-specific binary zip (`pantry-{os}-{arch}.zip`)
4. Extracts and replaces the binary at `~/.local/bin/pantry`

## Channels

### Stable (default)

```bash
pantry upgrade
```

Downloads from the latest non-prerelease GitHub release. This is the recommended channel.

### Canary

```bash
pantry upgrade --canary
```

Downloads the most recent release regardless of prerelease status. Use this for testing new features before they're stable.

## Platform Support

The upgrade command automatically detects your platform and downloads the correct binary:

| Platform | Binary |
|---|---|
| macOS (Apple Silicon) | `pantry-darwin-arm64.zip` |
| macOS (Intel) | `pantry-darwin-x64.zip` |
| Linux (x64) | `pantry-linux-x64.zip` |
| Linux (ARM64) | `pantry-linux-arm64.zip` |
| Windows (x64) | `pantry-windows-x64.zip` |
| FreeBSD (x64) | `pantry-freebsd-x64.zip` |

## Troubleshooting

### Permission denied

If the binary is installed in a system directory:

```bash
sudo pantry upgrade
```

### Already up to date

If you see "Already up to date!", your version matches the latest release. Use `--canary` to check for pre-releases.

### No binary found

If your platform isn't in the release assets, you can build from source:

```bash
git clone https://github.com/home-lang/pantry
cd pantry/packages/zig
zig build -Doptimize=ReleaseSafe
cp zig-out/bin/pantry ~/.local/bin/
```
