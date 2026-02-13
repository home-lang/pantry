# virtualenv

> Tool for creating isolated virtual python environments

## Package Information

- **Domain**: `virtualenv.pypa.io`
- **Name**: `virtualenv`
- **Homepage**: https://virtualenv.pypa.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/virtualenv.pypa.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install virtualenv.pypa.io
```

## Programs

This package provides the following executable programs:

- `virtualenv`

## Available Versions

<details>
<summary>Show all 51 versions</summary>

- `20.36.1`, `20.36.0`, `20.35.4`, `20.35.3`, `20.35.2`
- `20.35.1`, `20.35.0`, `20.34.0`, `20.33.1`, `20.33.0`
- `20.32.0`, `20.31.2`, `20.31.1`, `20.31.0`, `20.30.0`
- `20.29.3`, `20.29.2`, `20.29.1`, `20.29.0`, `20.28.1`
- `20.28.0`, `20.27.2`, `20.27.1`, `20.27.0`, `20.26.6`
- `20.26.5`, `20.26.4`, `20.26.3`, `20.26.2`, `20.26.1`
- `20.26.0`, `20.25.3`, `20.25.2`, `20.25.1`, `20.25.0`
- `20.24.7`, `20.24.6`, `20.24.5`, `20.24.4`, `20.24.3`
- `20.24.2`, `20.24.1`, `20.24.0`, `20.23.1`, `20.23.0`
- `20.22.0`, `20.21.1`, `20.21.0`, `20.20.0`, `20.19.0`
- `20.18.0`

</details>

**Latest Version**: `20.36.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +virtualenv.pypa.io@20.36.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1`
- `libexpat.github.io^2`
- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.virtualenv

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/virtualenv.pypa.io/package.yml)
- [Homepage](https://virtualenv.pypa.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
