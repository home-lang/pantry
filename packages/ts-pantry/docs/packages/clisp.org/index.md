# clisp

> GNU CLISP, a Common Lisp implementation

## Package Information

- **Domain**: `clisp.org`
- **Name**: `clisp`
- **Homepage**: <https://clisp.sourceforge.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/clisp.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install clisp.org
```

## Programs

This package provides the following executable programs:

- `clisp`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.49.92`

</details>

**Latest Version**: `2.49.92`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +clisp.org@2.49.92 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/libsigsegv^2.14`
- `gnu.org/readline^8.2`
- `github.com/besser82/libxcrypt^4.4`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.clisp

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/clisp.org/package.yml)
- [Homepage](https://clisp.sourceforge.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
