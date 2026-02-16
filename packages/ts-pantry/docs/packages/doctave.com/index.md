# doctave

> A batteries-included developer documentation site generator

## Package Information

- **Domain**: `doctave.com`
- **Name**: `doctave`
- **Homepage**: https://cli.doctave.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/doctave.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install doctave.com
```

## Programs

This package provides the following executable programs:

- `doctave`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.4.2`

</details>

**Latest Version**: `0.4.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +doctave.com@0.4.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.doctave

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/doctave.com/package.yml)
- [Homepage](https://cli.doctave.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
