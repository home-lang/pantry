# k6

> A modern load testing tool, using Go and JavaScript - https://k6.io

## Package Information

- **Domain**: `k6.io`
- **Name**: `k6`
- **Homepage**: https://k6.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/k6.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install k6.io
```

## Programs

This package provides the following executable programs:

- `k6`

## Available Versions

<details>
<summary>Show all 34 versions</summary>

- `1.5.0`, `1.4.2`, `1.4.1`, `1.4.0`, `1.3.0`
- `1.2.3`, `1.2.2`, `1.2.1`, `1.2.0`, `1.1.0`
- `1.0.0`, `0.59.0`, `0.58.0`, `0.57.0`, `0.56.0`
- `0.55.2`, `0.55.1`, `0.55.0`, `0.54.0`, `0.53.0`
- `0.52.0`, `0.51.0`, `0.50.0`, `0.49.0`, `0.48.0`
- `0.47.0`, `0.46.0`, `0.45.1`, `0.45.0`, `0.44.1`
- `0.44.0`, `0.43.1`, `0.43.0`, `0.42.0`

</details>

**Latest Version**: `1.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +k6.io@1.5.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.k6

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/k6.io/package.yml)
- [Homepage](https://k6.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
