# help2man

> Automatically generate simple man pages

## Package Information

- **Domain**: `gnu.org/help2man`
- **Name**: `help2man`
- **Homepage**: <https://www.gnu.org/software/help2man/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/help2man/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/help2man
```

## Programs

This package provides the following executable programs:

- `help2man`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.49.3`

</details>

**Latest Version**: `1.49.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/help2man@1.49.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/gettext^0`
- `perl.org~5.42 # perl modules require matching minors; must match gettext`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.help2man

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/help2man/package.yml)
- [Homepage](https://www.gnu.org/software/help2man/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
