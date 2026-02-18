# replibyte

> Seed your development database with real data ⚡️

## Package Information

- **Domain**: `replibyte.com`
- **Name**: `replibyte`
- **Homepage**: https://www.replibyte.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/replibyte.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install replibyte.com
```

## Programs

This package provides the following executable programs:

- `replibyte`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.10.0`

</details>

**Latest Version**: `0.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +replibyte.com@0.10.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.replibyte

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/replibyte.com/package.yml)
- [Homepage](https://www.replibyte.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
