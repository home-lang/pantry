# s-lang

> Library for creating multi-platform software

## Package Information

- **Domain**: `jedsoft.org/slang`
- **Name**: `s-lang`
- **Homepage**: <https://www.jedsoft.org/slang/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/jedsoft.org/slang/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install jedsoft.org/slang
```

## Programs

This package provides the following executable programs:

- `slsh`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.3.3`

</details>

**Latest Version**: `2.3.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +jedsoft.org/slang@2.3.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libpng.org`
- `linux:pcre.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['s-lang']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/jedsoft.org/slang/package.yml)
- [Homepage](https://www.jedsoft.org/slang/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
