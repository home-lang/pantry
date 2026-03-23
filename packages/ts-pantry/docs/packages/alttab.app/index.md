# AltTab

> A window switcher for macOS that brings the power of alt-tab from Windows.

## Package Information

- **Domain**: `alttab.app`
- **Name**: `AltTab`
- **Homepage**: <https://alt-tab-macos.netlify.app>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/alttab.app/package.yml)

## Installation

```bash
# Install with pantry
pantry install alttab.app
```

## Programs

This package provides the following executable programs:

- `alttab`

## Aliases

This package can also be accessed using these aliases:

- `alttab`
- `alt-tab`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `7.10.0`
- `7.9.0`
- `7.8.0`

</details>

**Latest Version**: `7.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +alttab.app@7.10.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.alttab

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/alttab.app/package.yml)
- [Homepage](https://alt-tab-macos.netlify.app)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
