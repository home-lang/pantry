# spotify_player

> A Spotify player in the terminal with full feature parity

## Package Information

- **Domain**: `crates.io/spotify_player`
- **Name**: `spotify_player`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/spotify_player/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/spotify_player
```

## Programs

This package provides the following executable programs:

- `spotify_player`

## Available Versions

<details>
<summary>Show all 19 versions</summary>

- `0.21.3`, `0.21.2`, `0.21.1`, `0.20.7`, `0.20.6`
- `0.20.5`, `0.20.4`, `0.20.3`, `0.20.2`, `0.20.1`
- `0.20.0`, `0.19.1`, `0.18.2`, `0.18.1`, `0.18.0`
- `0.17.2`, `0.17.1`, `0.17.0`, `0.0.0`

</details>

**Latest Version**: `0.21.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/spotify_player@0.21.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `github.com/libsixel/libsixel^1`
- `linux:alsa-project.org/alsa-lib^1`
- `linux:freedesktop.org/dbus^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.spotify_player

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/spotify_player/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
