# termusic

> Music Player TUI written in Rust

## Package Information

- **Domain**: `crates.io/termusic`
- **Name**: `termusic`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/termusic/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/termusic
```

## Programs

This package provides the following executable programs:

- `termusic`
- `termusic-server`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.12.1`, `0.12.0`
- `0.11.0`
- `0.10.0`
- `0.9.1`, `0.9.0`

</details>

**Latest Version**: `0.12.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/termusic@0.12.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:alsa-project.org/alsa-lib`
- `linux:freedesktop.org/dbus`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.termusic

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/termusic/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
