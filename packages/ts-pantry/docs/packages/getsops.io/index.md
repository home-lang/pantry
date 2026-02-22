# sops

> Simple and flexible tool for managing secrets

## Package Information

- **Domain**: `getsops.io`
- **Name**: `sops`
- **Homepage**: <https://getsops.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/getsops.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install getsops.io
```

## Programs

This package provides the following executable programs:

- `sops`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `3.12.1`
- `3.11.0`
- `3.10.2`, `3.10.1`, `3.10.0`
- `3.9.4`, `3.9.3`, `3.9.2`, `3.9.1`, `3.9.0`
- `3.8.1`

</details>

**Latest Version**: `3.12.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +getsops.io@3.12.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sops

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/getsops.io/package.yml)
- [Homepage](https://getsops.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
