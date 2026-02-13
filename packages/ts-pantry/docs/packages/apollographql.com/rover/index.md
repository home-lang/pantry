# rover

> CLI for managing and maintaining data graphs with Apollo Studio

## Package Information

- **Domain**: `apollographql.com/rover`
- **Name**: `rover`
- **Homepage**: https://www.apollographql.com/docs/rover/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/apollographql.com/rover/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install apollographql.com/rover
```

## Programs

This package provides the following executable programs:

- `rover`

## Available Versions

<details>
<summary>Show all 36 versions</summary>

- `0.37.2`, `0.37.1`, `0.37.0`, `0.36.2`, `0.36.1`
- `0.36.0`, `0.35.0`, `0.34.1`, `0.34.0`, `0.33.0`
- `0.32.1`, `0.32.0`, `0.31.2`, `0.31.1`, `0.31.0`
- `0.30.0`, `0.29.1`, `0.29.0`, `0.28.1`, `0.28.0`
- `0.27.2`, `0.27.1`, `0.27.0`, `0.26.3`, `0.26.2`
- `0.26.1`, `0.26.0`, `0.25.0`, `0.24.0`, `0.23.0`
- `0.22.0`, `0.21.0`, `0.20.0`, `0.19.1`, `0.19.0`
- `0.18.1`

</details>

**Latest Version**: `0.37.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +apollographql.com/rover@0.37.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `zlib.net^1`
- `libgit2.org~1.7 # links to libgit2.so.1.7`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rover

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/apollographql.com/rover/package.yml)
- [Homepage](https://www.apollographql.com/docs/rover/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
