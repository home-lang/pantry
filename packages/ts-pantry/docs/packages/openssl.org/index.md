# OpenSSL

> TLS/SSL and crypto library with QUIC APIs

## Package Information

- **Domain**: `openssl.org`
- **Name**: `OpenSSL`
- **Homepage**: <https://quictls.github.io/openssl>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openssl.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openssl.org
```

## Programs

This package provides the following executable programs:

- `openssl`
- `c_rehash`

## Available Versions

<details>
<summary>Show all 43 versions</summary>

- `3.6.1`, `3.6.0`, `3.5.5`, `3.5.4`, `3.5.3`
- `3.5.2`, `3.5.0`, `3.4.4`, `3.4.3`, `3.4.0`
- `3.3.6`, `3.3.5`, `3.3.2`, `3.3.1`, `3.3.0`
- `3.2.6`, `3.2.3`, `3.2.2`, `3.2.1`, `3.2.0`
- `3.1.7`, `3.1.6`, `3.1.5`, `3.1.4`, `3.1.3`
- `3.1.2`, `3.1.1`, `3.1.0`, `3.0.19`, `3.0.18`
- `3.0.15`, `3.0.14`, `3.0.13`, `3.0.12`, `3.0.11`
- `3.0.10`, `3.0.9`, `3.0.0`, `1.1.1w`, `1.1.1v`
- `1.1.1u`, `1.1.1t`, `1.1.1s`

</details>

**Latest Version**: `3.6.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openssl.org@3.6.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.OpenSSL

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openssl.org/package.yml)
- [Homepage](https://quictls.github.io/openssl)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
