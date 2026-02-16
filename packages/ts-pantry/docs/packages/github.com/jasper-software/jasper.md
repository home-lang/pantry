# jasper

> Official Repository for the JasPer Image Coding Toolkit

## Package Information

- **Domain**: `github.com/jasper-software/jasper`
- **Name**: `jasper`
- **Homepage**: <https://ece.engr.uvic.ca/~frodo/jasper/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jasper-software/jasper/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/jasper-software/jasper
```

## Programs

This package provides the following executable programs:

- `jasper`

## Available Versions

<details>
<summary>Show all 14 versions</summary>

- `4.2.8`, `4.2.7`, `4.2.6`, `4.2.5`, `4.2.4`
- `4.2.3`, `4.2.2`, `4.2.1`, `4.2.0`, `4.1.2`
- `4.1.1`, `4.1.0`, `4.0.1`, `4.0.0`

</details>

**Latest Version**: `4.2.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/jasper-software/jasper@4.2.8 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libjpeg-turbo.org^2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.jasper

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jasper-software/jasper/package.yml)
- [Homepage](https://ece.engr.uvic.ca/~frodo/jasper/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
