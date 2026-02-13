# libnsl

> This library contains the public client interface for NIS(YP) and NIS+ in a IPv6 ready version

## Package Information

- **Domain**: `github.com/thkukuk/libnsl`
- **Name**: `libnsl`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/thkukuk/libnsl/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/thkukuk/libnsl
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.0.1`, `2.0.0`

</details>

**Latest Version**: `2.0.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/thkukuk/libnsl@2.0.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `sourceforge.net/libtirpc`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libnsl

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/thkukuk/libnsl/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
