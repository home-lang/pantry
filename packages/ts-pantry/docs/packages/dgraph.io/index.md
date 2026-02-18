# dgraph

> high-performance graph database for real-time use cases

## Package Information

- **Domain**: `dgraph.io`
- **Name**: `dgraph`
- **Homepage**: <https://dgraph.io/docs>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/dgraph.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install dgraph.io
```

## Programs

This package provides the following executable programs:

- `dgraph`

## Available Versions

<details>
<summary>Show all 15 versions</summary>

- `25.2.0`
- `25.1.0`
- `25.0.0`
- `24.1.4`, `24.1.3`, `24.1.2`, `24.1.1`, `24.1.0`
- `24.0.5`, `24.0.4`, `24.0.2`, `24.0.1`, `24.0.0`
- `23.1.1`, `23.1.0`

</details>

**Latest Version**: `25.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +dgraph.io@25.2.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.dgraph

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/dgraph.io/package.yml)
- [Homepage](https://dgraph.io/docs)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
