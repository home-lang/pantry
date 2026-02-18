# hexedit

> View and edit files in hexadecimal or in ASCII

## Package Information

- **Domain**: `rigaux.org/hexedit`
- **Name**: `hexedit`
- **Homepage**: https://rigaux.org/hexedit.html
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rigaux.org/hexedit/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rigaux.org/hexedit
```

## Programs

This package provides the following executable programs:

- `hexedit`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.6.0`

</details>

**Latest Version**: `1.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rigaux.org/hexedit@1.6.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `invisible-island.net/ncurses@6`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.hexedit

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rigaux.org/hexedit/package.yml)
- [Homepage](https://rigaux.org/hexedit.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
