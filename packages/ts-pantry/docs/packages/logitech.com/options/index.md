# Logi Options+

> Logitech device customization and settings application.

## Package Information

- **Domain**: `logitech.com/options`
- **Name**: `Logi Options+`
- **Homepage**: <https://www.logitech.com/software/logi-options-plus.html>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/logitech.com/options/package.yml)

## Installation

```bash
# Install with pantry
pantry install logitech.com/options
```

## Programs

This package provides the following executable programs:

- `logi-options`

## Aliases

This package can also be accessed using these aliases:

- `logi-options-plus`
- `logi-options`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.80`
- `1.79`

</details>

**Latest Version**: `1.80`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +logitech.com/options@1.80 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['logi-options-plus']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/logitech.com/options/package.yml)
- [Homepage](https://www.logitech.com/software/logi-options-plus.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
