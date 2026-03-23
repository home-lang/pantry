# Obsidian

> A powerful knowledge base that works on local Markdown files.

## Package Information

- **Domain**: `obsidian.md`
- **Name**: `Obsidian`
- **Homepage**: <https://obsidian.md>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/obsidian.md/package.yml)

## Installation

```bash
# Install with pantry
pantry install obsidian.md
```

## Programs

This package provides the following executable programs:

- `obsidian`

## Aliases

This package can also be accessed using these aliases:

- `obsidian`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.7.7`, `1.7.6`, `1.7.5`

</details>

**Latest Version**: `1.7.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +obsidian.md@1.7.7 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.obsidian

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/obsidian.md/package.yml)
- [Homepage](https://obsidian.md)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
