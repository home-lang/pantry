# libimobiledevice-glue

> A library with common code used by libraries and tools around the libimobiledevice project

## Package Information

- **Domain**: `libimobiledevice.org/libimobiledevice-glue`
- **Name**: `libimobiledevice-glue`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libimobiledevice.org/libimobiledevice-glue/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libimobiledevice.org/libimobiledevice-glue
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.3.2`, `1.3.1`, `1.3.0`, `1.2.0`

</details>

**Latest Version**: `1.3.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libimobiledevice.org/libimobiledevice-glue@1.3.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libimobiledevice.org/libplist^2.4`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['libimobiledevice-glue']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libimobiledevice.org/libimobiledevice-glue/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
