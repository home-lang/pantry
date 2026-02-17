# ctags

> A maintained ctags implementation

## Package Information

- **Domain**: `ctags.io`
- **Name**: `ctags`
- **Homepage**: https://ctags.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ctags.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ctags.io
```

## Programs

This package provides the following executable programs:

- `ctags`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `6.2.1`, `6.2.0`
- `6.1.0`

</details>

**Latest Version**: `6.2.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ctags.io@6.2.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `digip.org/jansson^2`
- `pyyaml.org/libyaml^0.2`
- `pcre.org/v2^10`
- `gnome.org/libxml2~2.13 # 2.14 changes the API`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ctags

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ctags.io/package.yml)
- [Homepage](https://ctags.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
