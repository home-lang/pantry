# gnupg

> GNU Pretty Good Privacy (PGP) package

## Package Information

- **Domain**: `gnupg.org`
- **Name**: `gnupg`
- **Homepage**: https://gnupg.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnupg.org
```

## Programs

This package provides the following executable programs:

- `gpg`
- `gpg-agent`
- `gpg-connect-agent`
- `gpg-wks-server`
- `gpgconf`
- `gpgparsemail`
- `gpgscm`
- `gpgsm`
- `gpgsplit`
- `gpgtar`
- `gpgv`
- `kbxutil`
- `watchgnupg`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `2.4.9`, `2.4.8`, `2.4.7`, `2.4.6`, `2.4.5`
- `2.4.4`, `2.4.3`, `2.4.2`, `2.3.7`, `2.2.45`
- `2.2.44`, `2.2.43`, `2.2.42`

</details>

**Latest Version**: `2.4.9`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnupg.org@2.4.9 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1.1`
- `sourceware.org/bzip2`
- `gnupg.org/npth`
- `gnupg.org/libgpg-error`
- `gnupg.org/libksba`
- `gnupg.org/libassuan@2`
- `gnupg.org/libgcrypt`
- `gnupg.org/pinentry`
- `gnutls.org^3`
- `openldap.org^2`
- `gnu.org/readline^8`
- `sqlite.org^3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gnupg

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/package.yml)
- [Homepage](https://gnupg.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
