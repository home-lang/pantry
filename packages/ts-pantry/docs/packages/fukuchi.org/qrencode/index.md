# qrencode

> A fast and compact QR Code encoding library

## Package Information

- **Domain**: `fukuchi.org/qrencode`
- **Name**: `qrencode`
- **Homepage**: <https://fukuchi.org/works/qrencode/index.html.en>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/fukuchi.org/qrencode/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install fukuchi.org/qrencode
```

## Programs

This package provides the following executable programs:

- `qrencode`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `4.1.1`

</details>

**Latest Version**: `4.1.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +fukuchi.org/qrencode@4.1.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libpng.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.qrencode

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/fukuchi.org/qrencode/package.yml)
- [Homepage](https://fukuchi.org/works/qrencode/index.html.en)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
