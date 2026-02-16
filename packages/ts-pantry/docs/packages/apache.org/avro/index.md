# avro

> Apache Avro is a data serialization system.

## Package Information

- **Domain**: `apache.org/avro`
- **Name**: `avro`
- **Homepage**: https://avro.apache.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/avro/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install apache.org/avro
```

## Programs

This package provides the following executable programs:

- `avroappend`
- `avrocat`
- `avromod`
- `avropipe`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.12.0`, `1.11.3`

</details>

**Latest Version**: `1.12.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +apache.org/avro@1.12.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `digip.org/jansson`
- `google.github.io/snappy`
- `tukaani.org/xz`
- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.avro

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/avro/package.yml)
- [Homepage](https://avro.apache.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
