# mash

> mash up millions of open source packages into monstrously powerful scripts

## Package Information

- **Domain**: `pkgx.sh/mash`
- **Name**: `mash`
- **Homepage**: https://mash.pkgx.sh
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/mash/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pkgx.sh/mash
```

## Programs

This package provides the following executable programs:

- `mash`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `0.4.0`, `0.3.1`, `0.3.0`, `0.2.0`, `0.1.0`

</details>

**Latest Version**: `0.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pkgx.sh/mash@0.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1.1,^2`
- `gnu.org/bash`
- `curl.se`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mash

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/mash/package.yml)
- [Homepage](https://mash.pkgx.sh)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
