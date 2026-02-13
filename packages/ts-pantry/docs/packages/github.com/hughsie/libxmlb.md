# xb-tool

> A library to help create and query binary XML blobs

## Package Information

- **Domain**: `github.com/hughsie/libxmlb`
- **Name**: `xb-tool`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/hughsie/libxmlb/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/hughsie/libxmlb
```

## Programs

This package provides the following executable programs:

- `xb-tool`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.3.24`, `0.3.23`, `0.3.22`, `0.3.21`, `0.3.20`
- `0.3.19`

</details>

**Latest Version**: `0.3.24`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/hughsie/libxmlb@0.3.24 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/glib@2`
- `tukaani.org/xz@5`
- `facebook.com/zstd@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['xb-tool']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/hughsie/libxmlb/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
