# kind

> Kubernetes IN Docker - local clusters for testing Kubernetes

## Package Information

- **Domain**: `kind.sigs.k8s.io`
- **Name**: `kind`
- **Homepage**: <https://kind.sigs.k8s.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/kind.sigs.k8s.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install kind.sigs.k8s.io
```

## Programs

This package provides the following executable programs:

- `kind`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `0.31.0`
- `0.30.0`
- `0.29.0`
- `0.28.0`
- `0.27.0`
- `0.26.0`
- `0.25.0`
- `0.24.0`
- `0.23.0`
- `0.22.0`
- `0.21.0`
- `0.20.0`
- `0.19.0`

</details>

**Latest Version**: `0.31.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +kind.sigs.k8s.io@0.31.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.kind

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/kind.sigs.k8s.io/package.yml)
- [Homepage](https://kind.sigs.k8s.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
