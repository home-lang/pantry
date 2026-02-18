# corepack

> Platform built on V8 to build network applications

## Package Information

- **Domain**: `nodejs.org/corepack`
- **Name**: `corepack`
- **Homepage**: <https://nodejs.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/nodejs.org/corepack/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install nodejs.org/corepack
```

## Programs

This package provides the following executable programs:

- `corepack`

## Available Versions

<details>
<summary>Show all 19 versions</summary>

- `0.34.6`, `0.34.5`, `0.34.4`, `0.34.3`, `0.34.2`, `0.34.1`, `0.34.0`
- `0.33.0`
- `0.32.0`
- `0.31.0`
- `0.30.0`
- `0.29.4`, `0.29.3`, `0.29.2`
- `0.28.2`, `0.28.1`, `0.28.0`
- `0.27.0`
- `0.26.0`

</details>

**Latest Version**: `0.34.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +nodejs.org/corepack@0.34.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org^20`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.corepack

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/nodejs.org/corepack/package.yml)
- [Homepage](https://nodejs.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
