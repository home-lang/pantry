# duk

> Duktape - embeddable Javascript engine with a focus on portability and compact footprint

## Package Information

- **Domain**: `duktape.org`
- **Name**: `duk`
- **Homepage**: <https://duktape.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/duktape.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install duktape.org
```

## Programs

This package provides the following executable programs:

- `duk`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.7.0`

</details>

**Latest Version**: `2.7.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +duktape.org@2.7.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.duk

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/duktape.org/package.yml)
- [Homepage](https://duktape.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
