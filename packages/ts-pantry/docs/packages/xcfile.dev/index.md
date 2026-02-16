# xc

> Markdown defined task runner.

## Package Information

- **Domain**: `xcfile.dev`
- **Name**: `xc`
- **Homepage**: https://xcfile.dev/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/xcfile.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install xcfile.dev
```

## Programs

This package provides the following executable programs:

- `xc`

## Available Versions

<details>
<summary>Show all 29 versions</summary>

- `0.9.0`, `0.8.6`, `0.8.5`, `0.8.4`, `0.8.3`
- `0.8.2`, `0.8.1`, `0.8.0`, `0.7.0`, `0.6.0`
- `0.5.0`, `0.4.1`, `0.4.0`, `0.3.0`, `0.2.0`
- `0.1.181`, `0.1.180`, `0.0.180`, `0.0.175`, `0.0.169`
- `0.0.159`, `0.0.154`, `0.0.152`, `0.0.148`, `0.0.146`
- `0.0.144`, `0.0.142`, `0.0.111`, `0.0.110`

</details>

**Latest Version**: `0.9.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +xcfile.dev@0.9.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/xcfile.dev/package.yml)
- [Homepage](https://xcfile.dev/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
