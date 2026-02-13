# sccache

> Sccache is a ccache-like tool. It is used as a compiler wrapper and avoids compilation when possible. Sccache has the capability to utilize caching in remote storage environments, including various cloud storage options, or alternatively, in local storage.

## Package Information

- **Domain**: `crates.io/sccache`
- **Name**: `sccache`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/sccache/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/sccache
```

## Programs

This package provides the following executable programs:

- `sccache`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `0.13.0`, `0.12.0`, `0.11.0`, `0.10.0`, `0.9.1`
- `0.9.0`, `0.8.2`, `0.8.1`

</details>

**Latest Version**: `0.13.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/sccache@0.13.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sccache

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/sccache/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
