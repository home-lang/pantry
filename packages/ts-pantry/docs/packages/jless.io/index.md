# jless

> jless is a command-line JSON viewer designed for reading, exploring, and searching through JSON data.

## Package Information

- **Domain**: `jless.io`
- **Name**: `jless`
- **Homepage**: https://jless.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/jless.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install jless.io
```

## Programs

This package provides the following executable programs:

- `jless`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.9.0`

</details>

**Latest Version**: `0.9.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +jless.io@0.9.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:x.org/xcb@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.jless

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/jless.io/package.yml)
- [Homepage](https://jless.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
