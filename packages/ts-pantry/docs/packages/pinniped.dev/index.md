# pinniped

> Pinniped is the easy, secure way to log in to your Kubernetes clusters.

## Package Information

- **Domain**: `pinniped.dev`
- **Name**: `pinniped`
- **Homepage**: https://pinniped.dev
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pinniped.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pinniped.dev
```

## Programs

This package provides the following executable programs:

- `pinniped`

## Available Versions

<details>
<summary>Show all 18 versions</summary>

- `0.43.0`, `0.42.0`, `0.41.0`, `0.40.0`, `0.39.0`
- `0.38.0`, `0.37.0`, `0.36.0`, `0.35.0`, `0.34.0`
- `0.33.0`, `0.32.0`, `0.31.0`, `0.30.0`, `0.29.0`
- `0.28.0`, `0.27.0`, `0.26.0`

</details>

**Latest Version**: `0.43.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pinniped.dev@0.43.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pinniped

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pinniped.dev/package.yml)
- [Homepage](https://pinniped.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
