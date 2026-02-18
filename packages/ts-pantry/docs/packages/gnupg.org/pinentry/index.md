# pinentry

> Passphrase entry dialog utilizing the Assuan protocol

## Package Information

- **Domain**: `gnupg.org/pinentry`
- **Name**: `pinentry`
- **Homepage**: https://www.gnupg.org/related_software/pinentry/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/pinentry/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnupg.org/pinentry
```

## Programs

This package provides the following executable programs:

- `pinentry`
- `pinentry-tty`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.3.2`, `1.3.1`, `1.3.0`
- `1.2.1`

</details>

**Latest Version**: `1.3.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnupg.org/pinentry@1.3.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnupg.org/libassuan`
- `gnupg.org/libgpg-error`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pinentry

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/pinentry/package.yml)
- [Homepage](https://www.gnupg.org/related_software/pinentry/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
