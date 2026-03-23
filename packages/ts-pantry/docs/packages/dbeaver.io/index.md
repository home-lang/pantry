# DBeaver

> A universal database tool for developers and database administrators.

## Package Information

- **Domain**: `dbeaver.io`
- **Name**: `DBeaver`
- **Homepage**: <https://dbeaver.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/dbeaver.io/package.yml)

## Installation

```bash
# Install with pantry
pantry install dbeaver.io
```

## Programs

This package provides the following executable programs:

- `dbeaver`

## Aliases

This package can also be accessed using these aliases:

- `dbeaver`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `24.3.4`, `24.3.3`

</details>

**Latest Version**: `24.3.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +dbeaver.io@24.3.4 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.dbeaver

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/dbeaver.io/package.yml)
- [Homepage](https://dbeaver.io)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
