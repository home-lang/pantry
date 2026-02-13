# ack

> ack is a grep-like search tool optimized for source code.

## Package Information

- **Domain**: `beyondgrep.com`
- **Name**: `ack`
- **Homepage**: https://beyondgrep.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/beyondgrep.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install beyondgrep.com
```

## Programs

This package provides the following executable programs:

- `ack`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `3.9.0`, `3.8.2`, `3.8.1`, `3.8.0`, `3.7.0`
- `3.6.0`

</details>

**Latest Version**: `3.9.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +beyondgrep.com@3.9.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `perl.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ack

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/beyondgrep.com/package.yml)
- [Homepage](https://beyondgrep.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
