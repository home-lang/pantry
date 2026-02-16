# generic_sum

> An open source, portable, easy to use, readable and flexible TLS library, and reference implementation of the PSA Cryptography API. Releases are on a varying cadence, typically around 3 - 6 months between releases.

## Package Information

- **Domain**: `github.com/Mbed-TLS/mbedtls`
- **Name**: `generic_sum`
- **Homepage**: https://tls.mbed.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Mbed-TLS/mbedtls/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/Mbed-TLS/mbedtls
```

## Programs

This package provides the following executable programs:

- `generic_sum`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `3.6.3.1`, `3.6.0`, `3.5.2`, `3.5.1`, `3.4.1`
- `3.4.0`, `2.28.8`, `2.28.7`, `2.28.6`, `2.28.4`

</details>

**Latest Version**: `3.6.3.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/Mbed-TLS/mbedtls@3.6.3.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.generic_sum

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Mbed-TLS/mbedtls/package.yml)
- [Homepage](https://tls.mbed.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
