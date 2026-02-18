# libssh2

> the SSH library

## Package Information

- **Domain**: `libssh2.org`
- **Name**: `libssh2`
- **Homepage**: <https://libssh2.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libssh2.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libssh2.org
```

## Programs

This package provides the following executable programs:

No programs specified.

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.11.1`, `1.11.0`
- `1.10.0`

</details>

**Latest Version**: `1.11.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libssh2.org@1.11.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `zlib.net^1.2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libssh2

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libssh2.org/package.yml)
- [Homepage](https://libssh2.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
