# gpg-tui

> Manage your GnuPG keys with ease! 🔐

## Package Information

- **Domain**: `orhun.dev/gpg-tui`
- **Name**: `gpg-tui`
- **Homepage**: <https://blog.orhun.dev/introducing-gpg-tui/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/orhun.dev/gpg-tui/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install orhun.dev/gpg-tui
```

## Programs

This package provides the following executable programs:

- `gpg-tui`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.11.1`, `0.11.0`
- `0.10.0`

</details>

**Latest Version**: `0.11.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +orhun.dev/gpg-tui@0.11.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnupg.org`
- `gnupg.org/gpgme^1.12`
- `gnupg.org/libgpg-error`
- `x.org/xcb`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['gpg-tui']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/orhun.dev/gpg-tui/package.yml)
- [Homepage](https://blog.orhun.dev/introducing-gpg-tui/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
