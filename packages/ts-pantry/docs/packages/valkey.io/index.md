# valkey

> A flexible distributed key-value datastore that is optimized for caching and other realtime workloads.

## Package Information

- **Domain**: `valkey.io`
- **Name**: `valkey`
- **Homepage**: <https://valkey.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/valkey.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install valkey.io
```

## Programs

This package provides the following executable programs:

- `valkey-server`
- `valkey-cli`
- `valkey-benchmark`

## Available Versions

<details>
<summary>Show all 23 versions</summary>

- `9.0.2`, `9.0.1`, `9.0.0`, `8.1.5`, `8.1.4`
- `8.1.3`, `8.1.2`, `8.1.1`, `8.1.0`, `8.0.6`
- `8.0.5`, `8.0.4`, `8.0.3`, `8.0.2`, `8.0.1`
- `8.0.0`, `7.2.11`, `7.2.10`, `7.2.9`, `7.2.8`
- `7.2.7`, `7.2.6`, `7.2.5`

</details>

**Latest Version**: `9.0.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +valkey.io@9.0.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.valkey

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/valkey.io/package.yml)
- [Homepage](https://valkey.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
