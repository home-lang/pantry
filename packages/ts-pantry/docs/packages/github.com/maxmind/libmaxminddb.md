# mmdblookup

> C library for the MaxMind DB file format

## Package Information

- **Domain**: `github.com/maxmind/libmaxminddb`
- **Name**: `mmdblookup`
- **Homepage**: <https://maxmind.github.io/libmaxminddb/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/maxmind/libmaxminddb/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/maxmind/libmaxminddb
```

## Programs

This package provides the following executable programs:

- `mmdblookup`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `1.13.2`, `1.13.1`
- `1.12.2`, `1.12.1`, `1.12.0`
- `1.11.0`
- `1.10.0`
- `1.9.1`, `1.9.0`
- `1.8.0`
- `1.7.1`

</details>

**Latest Version**: `1.13.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/maxmind/libmaxminddb@1.13.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mmdblookup

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/maxmind/libmaxminddb/package.yml)
- [Homepage](https://maxmind.github.io/libmaxminddb/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
