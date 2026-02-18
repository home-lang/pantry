# libgpg-error

> Common error values for all GnuPG components

## Package Information

- **Domain**: `gnupg.org/libgpg-error`
- **Name**: `libgpg-error`
- **Homepage**: https://www.gnupg.org/related_software/libgpg-error/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/libgpg-error/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnupg.org/libgpg-error
```

## Programs

This package provides the following executable programs:

- `gpg-error`
- `gpg-error-config`
- `gpgrt-config`
- `yat2m`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `1.59.0`
- `1.57.0`
- `1.56.0`
- `1.55.0`
- `1.54.0`
- `1.53.0`
- `1.52.0`
- `1.51.0`
- `1.50.0`
- `1.49.0`
- `1.48.0`
- `1.47.0`
- `1.45.0`

</details>

**Latest Version**: `1.59.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnupg.org/libgpg-error@1.59.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['libgpg-error']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/libgpg-error/package.yml)
- [Homepage](https://www.gnupg.org/related_software/libgpg-error/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
