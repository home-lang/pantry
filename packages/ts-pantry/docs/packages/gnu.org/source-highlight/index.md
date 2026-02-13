# source-highlight

> Source-code syntax highlighter

## Package Information

- **Domain**: `gnu.org/source-highlight`
- **Name**: `source-highlight`
- **Homepage**: https://www.gnu.org/software/src-highlite/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/source-highlight/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/source-highlight
```

## Programs

This package provides the following executable programs:

- `check-regexp`
- `source-highlight`
- `source-highlight-settings`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `3.1.9`

</details>

**Latest Version**: `3.1.9`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/source-highlight@3.1.9 -- $SHELL -i
```

## Dependencies

This package depends on:

- `boost.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['source-highlight']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/source-highlight/package.yml)
- [Homepage](https://www.gnu.org/software/src-highlite/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
