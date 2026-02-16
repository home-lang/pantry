# keep

> The open-source AIOps and alert management platform

## Package Information

- **Domain**: `keephq.dev`
- **Name**: `keep`
- **Homepage**: https://keephq.dev
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/keephq.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install keephq.dev
```

## Programs

This package provides the following executable programs:

- `keep`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.0.0`

</details>

**Latest Version**: `0.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +keephq.dev@0.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3<3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.keep

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/keephq.dev/package.yml)
- [Homepage](https://keephq.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
