# gollum

> An n:m message multiplexer written in Go

## Package Information

- **Domain**: `github.com/gollum/gollum`
- **Name**: `gollum`
- **Homepage**: <https://gollum.readthedocs.io/en/latest/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/gollum/gollum/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/gollum/gollum
```

## Programs

This package provides the following executable programs:

- `gollum`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `6.1.0`
- `6.0.1`, `6.0.0`
- `5.3.2`

</details>

**Latest Version**: `6.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/gollum/gollum@6.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `ruby-lang.org^3.1`
- `rubygems.org~3.3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gollum

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/gollum/gollum/package.yml)
- [Homepage](https://gollum.readthedocs.io/en/latest/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
