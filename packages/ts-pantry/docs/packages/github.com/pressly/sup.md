# sup

> Super simple deployment tool - think of it like 'make' for a network of servers

## Package Information

- **Domain**: `github.com/pressly/sup`
- **Name**: `sup`
- **Homepage**: https://pressly.github.io/sup
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pressly/sup/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/pressly/sup
```

## Programs

This package provides the following executable programs:

- `sup`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.5.3`

</details>

**Latest Version**: `0.5.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/pressly/sup@0.5.3 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sup

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pressly/sup/package.yml)
- [Homepage](https://pressly.github.io/sup)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
