# rio

> A hardware-accelerated GPU terminal emulator focusing to run in desktops and browsers.

## Package Information

- **Domain**: `rioterm.com`
- **Name**: `rio`
- **Homepage**: https://rioterm.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rioterm.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rioterm.com
```

## Programs

This package provides the following executable programs:

- `rio`

## Available Versions

<details>
<summary>Show all 22 versions</summary>

- `0.2.37`, `0.2.36`, `0.2.35`, `0.2.34`, `0.2.33`
- `0.2.32`, `0.2.31`, `0.2.30`, `0.2.29`, `0.2.28`
- `0.2.27`, `0.2.26`, `0.2.25`, `0.2.24`, `0.2.23`
- `0.2.22`, `0.2.21`, `0.2.20`, `0.2.19`, `0.2.18`
- `0.2.17`, `0.2.16`

</details>

**Latest Version**: `0.2.37`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rioterm.com@0.2.37 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:freedesktop.org/fontconfig`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rio

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rioterm.com/package.yml)
- [Homepage](https://rioterm.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
