# krampus

> Command-line tool to kill one or more processes by port number

## Package Information

- **Domain**: `idleberg.github.io/krampus`
- **Name**: `krampus`
- **Homepage**: <https://pkg.go.dev/github.com/idleberg/krampus>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/idleberg.github.io/krampus/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install idleberg.github.io/krampus
```

## Programs

This package provides the following executable programs:

- `krampus`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.3.0`, `0.2.1`, `0.2.0`

</details>

**Latest Version**: `0.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +idleberg.github.io/krampus@0.3.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.krampus

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/idleberg.github.io/krampus/package.yml)
- [Homepage](https://pkg.go.dev/github.com/idleberg/krampus)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
