# Brave Browser

> A privacy-focused web browser that blocks ads and trackers.

## Package Information

- **Domain**: `brave.com`
- **Name**: `Brave Browser`
- **Homepage**: <https://brave.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/brave.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install brave.com
```

## Programs

This package provides the following executable programs:

- `brave`

## Aliases

This package can also be accessed using these aliases:

- `brave`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.74.48`, `1.74.47`, `1.74.46`

</details>

**Latest Version**: `1.74.48`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +brave.com@1.74.48 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.brave

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/brave.com/package.yml)
- [Homepage](https://brave.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
