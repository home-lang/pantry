# pkcs11-helper

> Library that simplifies the interaction with PKCS#11 providers for end-user applications using a simple API and optional OpenSSL engine

## Package Information

- **Domain**: `github.com/OpenSC/pkcs11-helper`
- **Name**: `pkcs11-helper`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/OpenSC/pkcs11-helper/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/OpenSC/pkcs11-helper
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.31.0`
- `1.30.0`
- `1.29.0`

</details>

**Latest Version**: `1.31.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/OpenSC/pkcs11-helper@1.31.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^3.1.0`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['pkcs11-helper']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/OpenSC/pkcs11-helper/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
