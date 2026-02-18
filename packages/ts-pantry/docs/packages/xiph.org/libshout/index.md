# shout

> Data and connectivity library for the icecast server

## Package Information

- **Domain**: `xiph.org/libshout`
- **Name**: `shout`
- **Homepage**: <https://icecast.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/xiph.org/libshout/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install xiph.org/libshout
```

## Programs

This package provides the following executable programs:

- `shout`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.4.6`

</details>

**Latest Version**: `2.4.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +xiph.org/libshout@2.4.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `xiph.org/ogg`
- `xiph.org/vorbis`
- `openssl.org~1`
- `speex.org`
- `theora.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.shout

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/xiph.org/libshout/package.yml)
- [Homepage](https://icecast.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
