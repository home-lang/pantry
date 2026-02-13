# cli

> Package from pantry: snaplet.dev/cli

## Package Information

- **Domain**: `snaplet.dev/cli`
- **Name**: `cli`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/snaplet.dev/cli/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install snaplet.dev/cli
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `nodejs.org^10.13.0 || ^12 || ^14 || ^16 || ^18 || ^20`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cli

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/snaplet.dev/cli/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
