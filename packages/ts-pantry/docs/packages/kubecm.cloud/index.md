# kubecm

> Manage your kubeconfig more easily.

## Package Information

- **Domain**: `kubecm.cloud`
- **Name**: `kubecm`
- **Homepage**: https://kubecm.cloud
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/kubecm.cloud/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install kubecm.cloud
```

## Programs

This package provides the following executable programs:

- `kubecm`

## Available Versions

<details>
<summary>Show all 14 versions</summary>

- `0.34.0`, `0.33.3`, `0.33.2`, `0.33.1`, `0.33.0`
- `0.32.3`, `0.32.2`, `0.32.1`, `0.32.0`, `0.31.0`
- `0.30.0`, `0.29.1`, `0.29.0`, `0.28.0`

</details>

**Latest Version**: `0.34.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +kubecm.cloud@0.34.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.kubecm

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/kubecm.cloud/package.yml)
- [Homepage](https://kubecm.cloud)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
