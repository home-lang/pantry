# aria2c

> aria2 is a lightweight multi-protocol & multi-source, cross platform download utility operated in command-line. It supports HTTP/HTTPS, FTP, SFTP, BitTorrent and Metalink.

## Package Information

- **Domain**: `aria2.github.io`
- **Name**: `aria2c`
- **Homepage**: https://aria2.github.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/aria2.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install aria2.github.io
```

## Programs

This package provides the following executable programs:

- `aria2c`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.37.0`
- `1.36.0`

</details>

**Latest Version**: `1.37.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +aria2.github.io@1.37.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1`
- `openssl.org^1`
- `libexpat.github.io`
- `sqlite.org^3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.aria2c

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/aria2.github.io/package.yml)
- [Homepage](https://aria2.github.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
