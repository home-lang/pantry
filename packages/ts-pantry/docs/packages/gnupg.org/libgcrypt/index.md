# libgcrypt

> Cryptographic library based on the code from GnuPG

## Package Information

- **Domain**: `gnupg.org/libgcrypt`
- **Name**: `libgcrypt`
- **Homepage**: <https://gnupg.org/related_software/libgcrypt/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/libgcrypt/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnupg.org/libgcrypt
```

## Programs

This package provides the following executable programs:

- `dumpsexp`
- `hmac256`
- `libgcrypt-config`
- `mpicalc`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `1.12.1`, `1.12.0`
- `1.11.2`, `1.11.1`, `1.11.0`
- `1.10.3`, `1.10.1`
- `1.8.12`

</details>

**Latest Version**: `1.12.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnupg.org/libgcrypt@1.12.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libgcrypt

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/libgcrypt/package.yml)
- [Homepage](https://gnupg.org/related_software/libgcrypt/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
