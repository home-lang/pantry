# wget

> Internet file retriever

## Package Information

- **Domain**: `gnu.org/wget`
- **Name**: `wget`
- **Homepage**: <https://www.gnu.org/software/wget/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/wget/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/wget
```

## Programs

This package provides the following executable programs:

- `wget`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.25.0`, `1.24.5`, `1.21.4`, `1.21.3`

</details>

**Latest Version**: `1.25.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/wget@1.25.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.wget

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/wget/package.yml)
- [Homepage](https://www.gnu.org/software/wget/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
