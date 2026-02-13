# libassuan-config

> Assuan IPC Library

## Package Information

- **Domain**: `gnupg.org/libassuan`
- **Name**: `libassuan-config`
- **Homepage**: https://www.gnupg.org/related_software/libassuan/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/libassuan/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnupg.org/libassuan
```

## Programs

This package provides the following executable programs:

- `libassuan-config`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `3.0.2`, `3.0.1`, `3.0.0`, `2.5.7`, `2.5.6`
- `2.5.5`

</details>

**Latest Version**: `3.0.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnupg.org/libassuan@3.0.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['libassuan-config']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/libassuan/package.yml)
- [Homepage](https://www.gnupg.org/related_software/libassuan/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
