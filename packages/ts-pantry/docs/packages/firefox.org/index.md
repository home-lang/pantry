# Firefox

> A free and open-source web browser.

## Package Information

- **Domain**: `firefox.org`
- **Name**: `Firefox`
- **Homepage**: <https://www.mozilla.org/firefox>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/firefox.org/package.yml)

## Installation

```bash
# Install with pantry
pantry install firefox.org
```

## Programs

This package provides the following executable programs:

- `firefox`

## Aliases

This package can also be accessed using these aliases:

- `firefox`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `134.0.2`, `134.0.1`, `134.0`

</details>

**Latest Version**: `134.0.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +firefox.org@134.0.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.firefox

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/firefox.org/package.yml)
- [Homepage](https://www.mozilla.org/firefox)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
