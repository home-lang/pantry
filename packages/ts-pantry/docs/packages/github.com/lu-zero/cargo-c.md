# cargo-c

> Helper program to build and install c-like libraries

## Package Information

- **Domain**: `github.com/lu-zero/cargo-c`
- **Name**: `cargo-c`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/lu-zero/cargo-c/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/lu-zero/cargo-c
```

## Programs

This package provides the following executable programs:

- `cargo-capi`
- `cargo-cbuild`
- `cargo-cinstall`
- `cargo-ctest`

## Available Versions

<details>
<summary>Show all 31 versions</summary>

- `0.10.19`, `0.10.18`, `0.10.17`, `0.10.16`, `0.10.15`
- `0.10.14`, `0.10.13`, `0.10.12`, `0.10.11`, `0.10.10`
- `0.10.9`, `0.10.8`, `0.10.7`, `0.10.6`, `0.10.5`
- `0.10.4`, `0.10.3`, `0.10.2`, `0.10.1`, `0.10.0`
- `0.9.32`, `0.9.31`, `0.9.30`, `0.9.29`, `0.9.28`
- `0.9.27`, `0.9.26`, `0.9.24`, `0.9.22`, `0.9.21`
- `0.9.20`

</details>

**Latest Version**: `0.10.19`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/lu-zero/cargo-c@0.10.19 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgit2.org~1.7 # links to libgit2.so.1.7`
- `libssh2.org`
- `openssl.org^1.1`
- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['cargo-c']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/lu-zero/cargo-c/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
