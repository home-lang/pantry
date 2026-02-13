# man-db

> Package from pantry: man-db.gitlab.io/man-db

## Package Information

- **Domain**: `man-db.gitlab.io/man-db`
- **Name**: `man-db`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/man-db.gitlab.io/man-db/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install man-db.gitlab.io/man-db
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `libpipeline.gitlab.io/libpipeline`
- `gnu.org/groff`
- `linux:gnu.org/gdbm`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['man-db']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/man-db.gitlab.io/man-db/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
