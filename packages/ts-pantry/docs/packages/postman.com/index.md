# Postman

> An API platform for building and testing APIs.

## Package Information

- **Domain**: `postman.com`
- **Name**: `Postman`
- **Homepage**: <https://postman.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/postman.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install postman.com
```

## Programs

This package provides the following executable programs:

- `postman`

## Aliases

This package can also be accessed using these aliases:

- `postman`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `11.27.0`
- `11.26.0`
- `11.25.0`

</details>

**Latest Version**: `11.27.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +postman.com@11.27.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.postman

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/postman.com/package.yml)
- [Homepage](https://postman.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
