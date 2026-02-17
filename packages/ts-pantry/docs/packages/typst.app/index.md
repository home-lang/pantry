# typst

> A new markup-based typesetting system that is powerful and easy to learn.

## Package Information

- **Domain**: `typst.app`
- **Name**: `typst`
- **Homepage**: https://typst.app/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/typst.app/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install typst.app
```

## Programs

This package provides the following executable programs:

- `typst`

## Available Versions

<details>
<summary>Show all 17 versions</summary>

- `0.14.2`, `0.14.1`, `0.14.0`
- `0.13.1`, `0.13.0`
- `0.12.0`
- `0.11.1`, `0.11.0`
- `0.10.0`
- `0.9.0`
- `0.8.0`
- `0.7.0`
- `0.6.0`
- `0.5.0`
- `0.4.0`
- `0.2.0`
- `0.0.0`

</details>

**Latest Version**: `0.14.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +typst.app@0.14.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.typst

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/typst.app/package.yml)
- [Homepage](https://typst.app/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
