# vorbis

> Reference implementation of the Ogg Vorbis audio format.

## Package Information

- **Domain**: `xiph.org/vorbis`
- **Name**: `vorbis`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/xiph.org/vorbis/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install xiph.org/vorbis
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.3.7`

</details>

**Latest Version**: `1.3.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +xiph.org/vorbis@1.3.7 -- $SHELL -i
```

## Dependencies

This package depends on:

- `xiph.org/ogg^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.vorbis

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/xiph.org/vorbis/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
