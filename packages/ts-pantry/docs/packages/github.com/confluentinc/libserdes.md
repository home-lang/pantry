# libserdes

> Avro Serialization/Deserialization C/C++ library with Confluent schema-registry support

## Package Information

- **Domain**: `github.com/confluentinc/libserdes`
- **Name**: `libserdes`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/confluentinc/libserdes/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/confluentinc/libserdes
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `7.5.2.231027084844`

</details>

**Latest Version**: `7.5.2.231027084844`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/confluentinc/libserdes@7.5.2.231027084844 -- $SHELL -i
```

## Dependencies

This package depends on:

- `apache.org/avro`
- `digip.org/jansson`
- `curl.se`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libserdes

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/confluentinc/libserdes/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
