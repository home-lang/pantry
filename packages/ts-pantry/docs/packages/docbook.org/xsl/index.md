# docbook-xsl

> XML vocabulary to create presentation-neutral documents

## Package Information

- **Domain**: `docbook.org/xsl`
- **Name**: `docbook-xsl`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/docbook.org/xsl/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install docbook.org/xsl
```

## Programs

This package provides the following executable programs:

- `dbtoepub`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.79.2`

</details>

**Latest Version**: `1.79.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +docbook.org/xsl@1.79.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `docbook.org^5`
- `gnome.org/libxml2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['docbook-xsl']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/docbook.org/xsl/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
