# unbound

> Unbound is a validating, recursive, and caching DNS resolver.

## Package Information

- **Domain**: `unbound.net`
- **Name**: `unbound`
- **Homepage**: https://nlnetlabs.nl/unbound
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/unbound.net/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install unbound.net
```

## Programs

This package provides the following executable programs:

- `unbound`
- `unbound-anchor`
- `unbound-checkconf`
- `unbound-control`
- `unbound-control-setup`
- `unbound-host`

## Available Versions

<details>
<summary>Show all 15 versions</summary>

- `1.24.2`, `1.24.1`, `1.24.0`, `1.23.1`, `1.23.0`
- `1.22.0`, `1.21.1`, `1.21.0`, `1.20.0`, `1.19.3`
- `1.19.2`, `1.19.1`, `1.19.0`, `1.18.0`, `1.17.1`

</details>

**Latest Version**: `1.24.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +unbound.net@1.24.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.unbound

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/unbound.net/package.yml)
- [Homepage](https://nlnetlabs.nl/unbound)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
