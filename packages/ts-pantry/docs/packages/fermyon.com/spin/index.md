# spin

> Spin is the open source developer tool for building and running serverless applications powered by WebAssembly.

## Package Information

- **Domain**: `fermyon.com/spin`
- **Name**: `spin`
- **Homepage**: <https://spinroot.com/spin/whatispin.html>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/fermyon.com/spin/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install fermyon.com/spin
```

## Programs

This package provides the following executable programs:

- `spin`

## Available Versions

<details>
<summary>Show all 12 versions</summary>

- `3.6.0`
- `3.5.1`
- `3.4.1`, `3.4.0`
- `3.3.1`, `3.3.0`
- `3.2.0`
- `3.1.2`, `3.1.1`, `3.1.0`
- `3.0.0`
- `2.7.0`

</details>

**Latest Version**: `3.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +fermyon.com/spin@3.6.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.spin

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/fermyon.com/spin/package.yml)
- [Homepage](https://spinroot.com/spin/whatispin.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
