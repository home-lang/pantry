# pushenv

> A CLI utility that reads a .env file before starting a process

## Package Information

- **Domain**: `crates.io/pushenv`
- **Name**: `pushenv`
- **Homepage**: https://crates.io/crates/pushenv
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/pushenv/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/pushenv
```

## Programs

This package provides the following executable programs:

- `pushenv`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.1.2`

</details>

**Latest Version**: `1.1.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/pushenv@1.1.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pushenv

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/pushenv/package.yml)
- [Homepage](https://crates.io/crates/pushenv)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
