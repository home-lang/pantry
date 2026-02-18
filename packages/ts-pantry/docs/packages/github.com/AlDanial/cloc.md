# cloc

> cloc counts blank lines, comment lines, and physical lines of source code in many programming languages.

## Package Information

- **Domain**: `github.com/AlDanial/cloc`
- **Name**: `cloc`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/AlDanial/cloc/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/AlDanial/cloc
```

## Programs

This package provides the following executable programs:

- `cloc`
- `config_data`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `2.8.0`
- `2.6.0`
- `2.4.0`
- `2.2.0`
- `2.0.0`
- `1.98.0`

</details>

**Latest Version**: `2.8.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/AlDanial/cloc@2.8.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `perl.org^5`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cloc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/AlDanial/cloc/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
