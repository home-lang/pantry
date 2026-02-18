# trurl

> a command line tool for URL parsing and manipulation.

## Package Information

- **Domain**: `curl.se/trurl`
- **Name**: `trurl`
- **Homepage**: <https://curl.se/trurl/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/curl.se/trurl/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install curl.se/trurl
```

## Programs

This package provides the following executable programs:

- `trurl`

## Available Versions

<details>
<summary>Show all 14 versions</summary>

- `0.16.1`, `0.16.0`
- `0.15.1`, `0.15.0`
- `0.14.0`
- `0.13.0`
- `0.12.0`
- `0.11.0`
- `0.10.0`
- `0.9.0`
- `0.8.0`
- `0.7.0`
- `0.6.0`
- `0.4.0`

</details>

**Latest Version**: `0.16.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +curl.se/trurl@0.16.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se^7,^8`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.trurl

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/curl.se/trurl/package.yml)
- [Homepage](https://curl.se/trurl/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
