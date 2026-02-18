# libkml

> Reference implementation of OGC KML 2.2

## Package Information

- **Domain**: `github.com/libkml/libkml`
- **Name**: `libkml`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libkml/libkml/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/libkml/libkml
```

## Programs

This package provides the following executable programs:

No programs specified.

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.3.0`

</details>

**Latest Version**: `1.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/libkml/libkml@1.3.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net/minizip^1.3`
- `uriparser.github.io^0.9`
- `curl.se^8`
- `libexpat.github.io^2.5`
- `boost.org>=1.81`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libkml

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libkml/libkml/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
