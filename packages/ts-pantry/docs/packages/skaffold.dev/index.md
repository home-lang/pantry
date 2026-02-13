# skaffold

> Easy and Repeatable Kubernetes Development

## Package Information

- **Domain**: `skaffold.dev`
- **Name**: `skaffold`
- **Homepage**: https://skaffold.dev/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/skaffold.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install skaffold.dev
```

## Programs

This package provides the following executable programs:

- `skaffold`

## Available Versions

<details>
<summary>Show all 17 versions</summary>

- `2.17.1`, `2.17.0`, `2.16.1`, `2.16.0`, `2.15.0`
- `2.14.2`, `2.14.1`, `2.14.0`, `2.13.2`, `2.13.0`
- `2.12.0`, `2.11.1`, `2.11.0`, `2.10.1`, `2.10.0`
- `2.9.0`, `2.8.0`

</details>

**Latest Version**: `2.17.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +skaffold.dev@2.17.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.skaffold

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/skaffold.dev/package.yml)
- [Homepage](https://skaffold.dev/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
