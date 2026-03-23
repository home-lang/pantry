# Notion

> An all-in-one workspace for notes, tasks, wikis, and databases.

## Package Information

- **Domain**: `notion.so`
- **Name**: `Notion`
- **Homepage**: <https://notion.so>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/notion.so/package.yml)

## Installation

```bash
# Install with pantry
pantry install notion.so
```

## Programs

This package provides the following executable programs:

- `notion`

## Aliases

This package can also be accessed using these aliases:

- `notion`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `4.5.0`
- `4.4.0`
- `4.3.0`

</details>

**Latest Version**: `4.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +notion.so@4.5.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.notion

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/notion.so/package.yml)
- [Homepage](https://notion.so)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
