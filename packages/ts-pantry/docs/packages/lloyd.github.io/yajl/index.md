# json

> A fast streaming JSON parsing library in C.

## Package Information

- **Domain**: `lloyd.github.io/yajl`
- **Name**: `json`
- **Homepage**: https://lloyd.github.io/yajl/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/lloyd.github.io/yajl/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install lloyd.github.io/yajl
```

## Programs

This package provides the following executable programs:

- `json_reformat`
- `json_verify`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.1.0`

</details>

**Latest Version**: `2.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +lloyd.github.io/yajl@2.1.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.json

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/lloyd.github.io/yajl/package.yml)
- [Homepage](https://lloyd.github.io/yajl/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
