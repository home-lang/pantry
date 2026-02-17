# keyring

> Easy way to access the system keyring service from python

## Package Information

- **Domain**: `github.com/jaraco/keyring`
- **Name**: `keyring`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jaraco/keyring/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/jaraco/keyring
```

## Programs

This package provides the following executable programs:

- `keyring`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `25.7.0`
- `25.6.0`
- `25.5.0`
- `25.4.1`, `25.4.0`
- `25.3.0`
- `25.2.1`, `25.2.0`
- `25.1.0`
- `25.0.1`, `25.0.0`
- `24.3.1`, `24.3.0`

</details>

**Latest Version**: `25.7.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/jaraco/keyring@25.7.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`
- `github.com/python-cffi/cffi^1.16`
- `github.com/eliben/pycparser^2.21`
- `cryptography.io^42`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.keyring

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jaraco/keyring/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
