# libepoxy

> Epoxy is a library for handling OpenGL function pointer management for you

## Package Information

- **Domain**: `github.com/anholt/libepoxy`
- **Name**: `libepoxy`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/anholt/libepoxy/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/anholt/libepoxy
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.5.10`

</details>

**Latest Version**: `1.5.10`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/anholt/libepoxy@1.5.10 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:x.org/x11`
- `linux:mesa3d.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libepoxy

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/anholt/libepoxy/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
