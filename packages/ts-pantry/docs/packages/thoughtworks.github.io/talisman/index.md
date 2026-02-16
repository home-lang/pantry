# talisman

> Using a pre-commit hook, Talisman validates the outgoing changeset for things that look suspicious — such as tokens, passwords, and private keys.

## Package Information

- **Domain**: `thoughtworks.github.io/talisman`
- **Name**: `talisman`
- **Homepage**: https://thoughtworks.github.io/talisman/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/thoughtworks.github.io/talisman/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install thoughtworks.github.io/talisman
```

## Programs

This package provides the following executable programs:

- `talisman`

## Available Versions

<details>
<summary>Show all 12 versions</summary>

- `1.37.0`, `1.36.1`, `1.36.0`, `1.35.1`, `1.35.0`
- `1.34.0`, `1.33.2`, `1.33.1`, `1.33.0`, `1.32.2`
- `1.32.1`, `1.32.0`

</details>

**Latest Version**: `1.37.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +thoughtworks.github.io/talisman@1.37.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.talisman

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/thoughtworks.github.io/talisman/package.yml)
- [Homepage](https://thoughtworks.github.io/talisman/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
