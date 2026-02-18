# minisign

> A dead simple tool to sign files and verify digital signatures.

## Package Information

- **Domain**: `jedisct1.github.io/minisign`
- **Name**: `minisign`
- **Homepage**: <https://jedisct1.github.io/minisign/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/jedisct1.github.io/minisign/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install jedisct1.github.io/minisign
```

## Programs

This package provides the following executable programs:

- `minisign`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.12.0`
- `0.11.0`

</details>

**Latest Version**: `0.12.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +jedisct1.github.io/minisign@0.12.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.minisign

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/jedisct1.github.io/minisign/package.yml)
- [Homepage](https://jedisct1.github.io/minisign/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
