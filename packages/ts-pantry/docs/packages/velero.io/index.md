# velero

> Backup and migrate Kubernetes applications and their persistent volumes

## Package Information

- **Domain**: `velero.io`
- **Name**: `velero`
- **Homepage**: <https://velero.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/velero.io/package.yml)

## Installation

```bash
# Install with pantry
pantry install velero.io
```

## Programs

This package provides the following executable programs:

- `velero`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `1.18.0`
- `1.17.2`, `1.17.1`, `1.17.0`
- `1.16.2`, `1.16.1`

</details>

**Latest Version**: `1.18.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +velero.io@1.18.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.velero

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/velero.io/package.yml)
- [Homepage](https://velero.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
