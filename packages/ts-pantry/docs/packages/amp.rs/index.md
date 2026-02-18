# amp

> A complete text editor for your terminal.

## Package Information

- **Domain**: `amp.rs`
- **Name**: `amp`
- **Homepage**: <https://amp.rs>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/amp.rs/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install amp.rs
```

## Programs

This package provides the following executable programs:

- `amp`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.7.1`

</details>

**Latest Version**: `0.7.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +amp.rs@0.7.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net@1`
- `libgit2.org@1`
- `linux:openssl.org@1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.amp

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/amp.rs/package.yml)
- [Homepage](https://amp.rs)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
