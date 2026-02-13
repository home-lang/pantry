# elfutils.org

> Package from pantry: elfutils.org

## Package Information

- **Domain**: `elfutils.org`
- **Name**: `elfutils.org`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/elfutils.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install elfutils.org
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `sourceware.org/bzip2`
- `tukaani.org/xz`
- `zlib.net`
- `facebook.com/zstd`
- `linux:kernel.org/linux-headers`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['elfutils.org']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/elfutils.org/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
