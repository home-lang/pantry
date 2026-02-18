# neon-config

> neon - an HTTP/1.1 and WebDAV client library with a C API

## Package Information

- **Domain**: `notroj.github.io/neon`
- **Name**: `neon-config`
- **Homepage**: <https://notroj.github.io/neon/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/notroj.github.io/neon/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install notroj.github.io/neon
```

## Programs

This package provides the following executable programs:

- `neon-config`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `0.36.0`
- `0.35.0`
- `0.34.2`, `0.34.1`, `0.34.0`
- `0.33.0`
- `0.32.5`

</details>

**Latest Version**: `0.36.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +notroj.github.io/neon@0.36.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['neon-config']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/notroj.github.io/neon/package.yml)
- [Homepage](https://notroj.github.io/neon/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
