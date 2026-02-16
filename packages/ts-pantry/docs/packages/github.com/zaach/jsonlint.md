# jsonlint

> A JSON parser and validator with a CLI.

## Package Information

- **Domain**: `github.com/zaach/jsonlint`
- **Name**: `jsonlint`
- **Homepage**: <http://zaach.github.com/jsonlint/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/zaach/jsonlint/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/zaach/jsonlint
```

## Programs

This package provides the following executable programs:

- `jsonlint`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.6.0`

</details>

**Latest Version**: `1.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/zaach/jsonlint@1.6.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org^20`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.jsonlint

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/zaach/jsonlint/package.yml)
- [Homepage](http://zaach.github.com/jsonlint/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
