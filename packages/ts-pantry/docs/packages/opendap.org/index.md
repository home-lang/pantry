# opendap

> A new version of libdap that contains both DAP2 and DAP4 support

## Package Information

- **Domain**: `opendap.org`
- **Name**: `opendap`
- **Homepage**: <https://www.opendap.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/opendap.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install opendap.org
```

## Programs

This package provides the following executable programs:

- `dap-config`
- `dap-config-pkgconfig`
- `getdap`
- `getdap4`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `3.21.1`
- `3.20.11`

</details>

**Latest Version**: `3.21.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +opendap.org@3.21.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/libxml2`
- `openssl.org`
- `curl.se`
- `linux:sourceforge.net/libtirpc`
- `linux:github.com/util-linux/util-linux`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.opendap

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/opendap.org/package.yml)
- [Homepage](https://www.opendap.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
