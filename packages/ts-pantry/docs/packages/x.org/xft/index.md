# xft

> Package from pantry: x.org/xft

## Package Information

- **Domain**: `x.org/xft`
- **Name**: `xft`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xft/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install x.org/xft
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `freedesktop.org/fontconfig^2.14`
- `x.org/xrender^0.9`
- `sourceware.org/bzip2^1`
- `zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xft

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xft/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
