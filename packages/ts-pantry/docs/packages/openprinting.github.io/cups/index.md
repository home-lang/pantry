# cups

> Common UNIX Printing System

## Package Information

- **Domain**: `openprinting.github.io/cups`
- **Name**: `cups`
- **Homepage**: <https://openprinting.github.io/cups>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openprinting.github.io/cups/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openprinting.github.io/cups
```

## Programs

This package provides the following executable programs:

- `cups-config`
- `ippeveprinter`
- `ipptool`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `2.4.16`, `2.4.15`, `2.4.14`, `2.4.13`, `2.4.12`, `2.4.11`, `2.4.10`, `2.4.9`, `2.4.8`, `2.4.7`, `2.4.6`

</details>

**Latest Version**: `2.4.16`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openprinting.github.io/cups@2.4.16 -- $SHELL -i
```

## Dependencies

This package depends on:

- `kerberos.org`
- `zlib.net`
- `linux:openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cups

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openprinting.github.io/cups/package.yml)
- [Homepage](https://openprinting.github.io/cups)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
