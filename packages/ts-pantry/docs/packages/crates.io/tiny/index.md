# tiny

> A terminal IRC client

## Package Information

- **Domain**: `crates.io/tiny`
- **Name**: `tiny`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/tiny/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/tiny
```

## Programs

This package provides the following executable programs:

- `tiny`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.13.0`, `0.12.0`, `0.11.0`

</details>

**Latest Version**: `0.13.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/tiny@0.13.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tiny

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/tiny/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
