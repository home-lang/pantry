# pkgm

> Install `pkgx` packages to `/usr/local`

## Package Information

- **Domain**: `pkgx.sh/pkgm`
- **Name**: `pkgm`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/pkgm/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pkgx.sh/pkgm
```

## Programs

This package provides the following executable programs:

- `pkgm`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `0.11.1`, `0.11.0`, `0.10.1`, `0.10.0`, `0.9.2`
- `0.9.1`, `0.9.0`, `0.8.0`, `0.7.2`, `0.7.1`

</details>

**Latest Version**: `0.11.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pkgx.sh/pkgm@0.11.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^2`
- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pkgm

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/pkgm/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
