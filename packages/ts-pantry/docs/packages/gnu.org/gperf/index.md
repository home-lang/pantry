# gperf

> Perfect hash function generator

## Package Information

- **Domain**: `gnu.org/gperf`
- **Name**: `gperf`
- **Homepage**: <https://www.gnu.org/software/gperf/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gperf/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/gperf
```

## Programs

This package provides the following executable programs:

- `gperf`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `3.3.0`
- `3.2.1`, `3.2.0`
- `3.1.0`

</details>

**Latest Version**: `3.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/gperf@3.3.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gperf

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gperf/package.yml)
- [Homepage](https://www.gnu.org/software/gperf/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
