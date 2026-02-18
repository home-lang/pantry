# epstool

> Edit preview images and fix bounding boxes in EPS files

## Package Information

- **Domain**: `ghostgum.com.au/epstool`
- **Name**: `epstool`
- **Homepage**: <http://www.ghostgum.com.au/software/epstool.htm>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ghostgum.com.au/epstool/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ghostgum.com.au/epstool
```

## Programs

This package provides the following executable programs:

- `epstool`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `3.9.0`

</details>

**Latest Version**: `3.9.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ghostgum.com.au/epstool@3.9.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `ghostscript.com`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.epstool

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ghostgum.com.au/epstool/package.yml)
- [Homepage](http://www.ghostgum.com.au/software/epstool.htm)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
