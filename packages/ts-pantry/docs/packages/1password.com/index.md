# 1Password

> A password manager and secure vault.

## Package Information

- **Domain**: `1password.com`
- **Name**: `1Password`
- **Homepage**: <https://1password.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/1password.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install 1password.com
```

## Programs

This package provides the following executable programs:

- `1password`

## Aliases

This package can also be accessed using these aliases:

- `1password`
- `onepassword`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `8.10.56`, `8.10.55`, `8.10.54`

</details>

**Latest Version**: `8.10.56`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +1password.com@8.10.56 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['1password']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/1password.com/package.yml)
- [Homepage](https://1password.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
