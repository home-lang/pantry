# pluralith

> A tool for Terraform state visualisation and automated generation of infrastructure documentation

## Package Information

- **Domain**: `pluralith.com`
- **Name**: `pluralith`
- **Homepage**: <https://www.pluralith.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pluralith.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pluralith.com
```

## Programs

This package provides the following executable programs:

- `pluralith`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.2.2`

</details>

**Latest Version**: `0.2.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pluralith.com@0.2.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pluralith

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pluralith.com/package.yml)
- [Homepage](https://www.pluralith.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
