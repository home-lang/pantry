# ksops

> KSOPS - A Flexible Kustomize Plugin for SOPS Encrypted Resources

## Package Information

- **Domain**: `viaduct.ai/ksops`
- **Name**: `ksops`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/viaduct.ai/ksops/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install viaduct.ai/ksops
```

## Programs

This package provides the following executable programs:

- `ksops`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `4.4.0`
- `4.3.3`, `4.3.2`

</details>

**Latest Version**: `4.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +viaduct.ai/ksops@4.4.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ksops

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/viaduct.ai/ksops/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
