# thrift

> Framework for scalable cross-language services development

## Package Information

- **Domain**: `apache.org/thrift`
- **Name**: `thrift`
- **Homepage**: <https://thrift.apache.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/thrift/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install apache.org/thrift
```

## Programs

This package provides the following executable programs:

- `thrift`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `0.22.0`
- `0.21.0`
- `0.20.0`
- `0.19.0`
- `0.18.1`

</details>

**Latest Version**: `0.22.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +apache.org/thrift@0.22.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org@1.1`
- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.thrift

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/thrift/package.yml)
- [Homepage](https://thrift.apache.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
