# flux

> Open and extensible continuous delivery solution for Kubernetes. Powered by GitOps Toolkit.

## Package Information

- **Domain**: `fluxcd.io/flux2`
- **Name**: `flux`
- **Homepage**: <https://fluxcd.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/fluxcd.io/flux2/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install fluxcd.io/flux2
```

## Programs

This package provides the following executable programs:

- `flux`

## Available Versions

<details>
<summary>Show all 20 versions</summary>

- `2.7.5`, `2.7.4`, `2.7.3`, `2.7.2`, `2.7.1`, `2.7.0`
- `2.6.4`, `2.6.3`, `2.6.2`, `2.6.1`, `2.6.0`
- `2.5.1`, `2.5.0`
- `2.4.0`
- `2.3.0`
- `2.2.3`, `2.2.2`, `2.2.1`, `2.2.0`
- `2.1.2`

</details>

**Latest Version**: `2.7.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +fluxcd.io/flux2@2.7.5 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.flux

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/fluxcd.io/flux2/package.yml)
- [Homepage](https://fluxcd.io)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
