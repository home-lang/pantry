# mergiraf

> Syntax-aware git merge driver

## Package Information

- **Domain**: `mergiraf.org`
- **Name**: `mergiraf`
- **Homepage**: https://mergiraf.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mergiraf.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mergiraf.org
```

## Programs

This package provides the following executable programs:

- `mergiraf`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `0.16.1`, `0.15.0`, `0.14.0`, `0.13.0`, `0.12.1`
- `0.12.0`, `0.11.0`, `0.10.0`

</details>

**Latest Version**: `0.16.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mergiraf.org@0.16.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mergiraf

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mergiraf.org/package.yml)
- [Homepage](https://mergiraf.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
