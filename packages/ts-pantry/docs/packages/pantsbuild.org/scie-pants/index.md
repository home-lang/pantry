# scie-pants

> Protects your Pants from the elements.

## Package Information

- **Domain**: `pantsbuild.org/scie-pants`
- **Name**: `scie-pants`
- **Homepage**: <https://www.pantsbuild.org/docs/installation>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pantsbuild.org/scie-pants/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pantsbuild.org/scie-pants
```

## Programs

This package provides the following executable programs:

- `pants`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `0.12.5`, `0.12.3`, `0.12.2`, `0.12.1`, `0.12.0`

</details>

**Latest Version**: `0.12.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pantsbuild.org/scie-pants@0.12.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['scie-pants']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pantsbuild.org/scie-pants/package.yml)
- [Homepage](https://www.pantsbuild.org/docs/installation)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
