# dym

> A CLI spelling corrector for when you're unsure

## Package Information

- **Domain**: `crates.io/didyoumean`
- **Name**: `dym`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/didyoumean/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/didyoumean
```

## Programs

This package provides the following executable programs:

- `dym`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.1.4`

</details>

**Latest Version**: `1.1.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/didyoumean@1.1.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `linux:x.org/xcb`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.dym

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/didyoumean/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
