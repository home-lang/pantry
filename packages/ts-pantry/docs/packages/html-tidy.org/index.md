# tidy

> The granddaddy of HTML tools, with support for modern standards

## Package Information

- **Domain**: `html-tidy.org`
- **Name**: `tidy`
- **Homepage**: <https://www.html-tidy.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/html-tidy.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install html-tidy.org
```

## Programs

This package provides the following executable programs:

- `tidy`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `5.8.0`

</details>

**Latest Version**: `5.8.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +html-tidy.org@5.8.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tidy

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/html-tidy.org/package.yml)
- [Homepage](https://www.html-tidy.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
