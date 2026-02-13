# mkdocs

> Project documentation with Markdown.

## Package Information

- **Domain**: `mkdocs.org`
- **Name**: `mkdocs`
- **Homepage**: https://www.mkdocs.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mkdocs.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mkdocs.org
```

## Programs

This package provides the following executable programs:

- `mkdocs`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.6.1`, `1.6.0`, `1.5.3`

</details>

**Latest Version**: `1.6.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mkdocs.org@1.6.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3<3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mkdocs

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mkdocs.org/package.yml)
- [Homepage](https://www.mkdocs.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
