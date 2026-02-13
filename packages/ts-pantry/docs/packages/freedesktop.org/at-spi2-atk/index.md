# at-spi2-atk

> Package from pantry: freedesktop.org/at-spi2-atk

## Package Information

- **Domain**: `freedesktop.org/at-spi2-atk`
- **Name**: `at-spi2-atk`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/at-spi2-atk/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install freedesktop.org/at-spi2-atk
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `gnome.org/atk`
- `gnome.org/libxml2`
- `freedesktop.org/dbus`
- `x.org/xtst`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['at-spi2-atk']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/at-spi2-atk/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
