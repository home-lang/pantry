# litecli

> CLI for SQLite Databases with auto-completion and syntax highlighting

## Package Information

- **Domain**: `litecli.com`
- **Name**: `litecli`
- **Homepage**: https://litecli.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/litecli.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install litecli.com
```

## Programs

This package provides the following executable programs:

- `litecli`

## Available Versions

<details>
<summary>Show all 17 versions</summary>

- `1.17.0`, `1.16.0`, `1.15.0`, `1.14.4`, `1.14.3`
- `1.14.2`, `1.14.1`, `1.14.0`, `1.13.2`, `1.13.0`
- `1.12.4`, `1.12.3`, `1.12.2`, `1.11.1`, `1.11.0`
- `1.10.1`, `1.10.0`

</details>

**Latest Version**: `1.17.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +litecli.com@1.17.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1`
- `sqlite.org^3.45`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.litecli

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/litecli.com/package.yml)
- [Homepage](https://litecli.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
