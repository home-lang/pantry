# mandoc.bsd.lv

> UNIX manpage compiler toolset

## Package Information

- **Domain**: `mandoc.bsd.lv`
- **Name**: `mandoc.bsd.lv`
- **Homepage**: https://mandoc.bsd.lv/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mandoc.bsd.lv/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mandoc.bsd.lv
```

## Programs

This package provides the following executable programs:

- `bsdapropos`
- `bsdman`
- `bsdsoelim`
- `bsdwhatis`
- `demandoc`
- `mandoc`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.14.6`

</details>

**Latest Version**: `1.14.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mandoc.bsd.lv@1.14.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['mandoc.bsd.lv']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mandoc.bsd.lv/package.yml)
- [Homepage](https://mandoc.bsd.lv/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
