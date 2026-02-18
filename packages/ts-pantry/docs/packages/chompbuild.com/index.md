# chomp

> 'JS Make' - parallel task runner for the frontend ecosystem with a JS extension system.

## Package Information

- **Domain**: `chompbuild.com`
- **Name**: `chomp`
- **Homepage**: <https://chompbuild.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/chompbuild.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install chompbuild.com
```

## Programs

This package provides the following executable programs:

- `chomp`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.2.23`

</details>

**Latest Version**: `0.2.23`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +chompbuild.com@0.2.23 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.chomp

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/chompbuild.com/package.yml)
- [Homepage](https://chompbuild.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
