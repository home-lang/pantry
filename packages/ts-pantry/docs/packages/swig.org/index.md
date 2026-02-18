# swig

> SWIG is a software development tool that connects programs written in C and C++ with a variety of high-level programming languages.

## Package Information

- **Domain**: `swig.org`
- **Name**: `swig`
- **Homepage**: <https://www.swig.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/swig.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install swig.org
```

## Programs

This package provides the following executable programs:

- `swig`
- `ccache-swig`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `4.4.1`, `4.4.0`
- `4.3.1`, `4.3.0`
- `4.2.1`, `4.2.0`
- `4.1.1`

</details>

**Latest Version**: `4.4.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +swig.org@4.4.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pcre.org/v2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.swig

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/swig.org/package.yml)
- [Homepage](https://www.swig.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
