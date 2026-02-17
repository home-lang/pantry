# gitsign

> Keyless Git signing using Sigstore

## Package Information

- **Domain**: `sigstore.dev/gitsign`
- **Name**: `gitsign`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sigstore.dev/gitsign/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sigstore.dev/gitsign
```

## Programs

This package provides the following executable programs:

- `gitsign`
- `gitsign-credential-cache`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `0.14.0`
- `0.13.0`
- `0.12.0`
- `0.11.0`
- `0.10.2`, `0.10.1`, `0.10.0`
- `0.9.0`
- `0.8.1`, `0.8.0`
- `0.7.1`

</details>

**Latest Version**: `0.14.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sigstore.dev/gitsign@0.14.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `git-scm.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gitsign

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sigstore.dev/gitsign/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
