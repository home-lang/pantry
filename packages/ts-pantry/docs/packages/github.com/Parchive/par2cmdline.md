# par2

> Parchive: Parity Archive Volume Set for data recovery

## Package Information

- **Domain**: `github.com/Parchive/par2cmdline`
- **Name**: `par2`
- **Homepage**: <http://parchive.sourceforge.net>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Parchive/par2cmdline/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/Parchive/par2cmdline
```

## Programs

This package provides the following executable programs:

- `par2`
- `par2create`
- `par2verify`
- `par2repair`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.1.1`, `1.1.0`, `1.0.0`, `0.8.1`

</details>

**Latest Version**: `1.1.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/Parchive/par2cmdline@1.1.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.par2

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Parchive/par2cmdline/package.yml)
- [Homepage](http://parchive.sourceforge.net)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
