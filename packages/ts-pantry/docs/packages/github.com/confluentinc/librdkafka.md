# librdkafka

> The Apache Kafka C/C++ library

## Package Information

- **Domain**: `github.com/confluentinc/librdkafka`
- **Name**: `librdkafka`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/confluentinc/librdkafka/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/confluentinc/librdkafka
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 17 versions</summary>

- `2.13.0`, `2.12.1`, `2.12.0`, `2.11.1`, `2.11.0`
- `2.10.1`, `2.10.0`, `2.8.0`, `2.6.1`, `2.6.0`
- `2.5.3`, `2.5.0`, `2.4.0`, `2.3.0`, `2.2.1`
- `2.2.0`, `2.1.1`

</details>

**Latest Version**: `2.13.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/confluentinc/librdkafka@2.13.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `lz4.org`
- `zlib.net`
- `openssl.org^1.1`
- `facebook.com/zstd`
- `curl.se`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.librdkafka

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/confluentinc/librdkafka/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
