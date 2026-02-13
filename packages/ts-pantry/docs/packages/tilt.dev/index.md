# tilt

> Define your dev environment as code. For microservice apps on Kubernetes.

## Package Information

- **Domain**: `tilt.dev`
- **Name**: `tilt`
- **Homepage**: https://tilt.dev/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tilt.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tilt.dev
```

## Programs

This package provides the following executable programs:

- `tilt`

## Available Versions

<details>
<summary>Show all 28 versions</summary>

- `0.36.1`, `0.36.0`, `0.35.2`, `0.35.1`, `0.35.0`
- `0.34.5`, `0.34.4`, `0.34.3`, `0.34.2`, `0.34.1`
- `0.34.0`, `0.33.22`, `0.33.21`, `0.33.20`, `0.33.19`
- `0.33.18`, `0.33.17`, `0.33.16`, `0.33.15`, `0.33.14`
- `0.33.13`, `0.33.12`, `0.33.11`, `0.33.10`, `0.33.9`
- `0.33.8`, `0.33.7`, `0.33.6`

</details>

**Latest Version**: `0.36.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tilt.dev@0.36.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tilt

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tilt.dev/package.yml)
- [Homepage](https://tilt.dev/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
