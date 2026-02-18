# Scryer Prolog

> Modern ISO Prolog implementation written mostly in Rust

## Package Information

- **Domain**: `scryer.pl`
- **Name**: `Scryer Prolog`
- **Homepage**: <https://www.scryer.pl>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/scryer.pl/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install scryer.pl
```

## Programs

This package provides the following executable programs:

- `scryer-prolog`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.10.0`
- `0.9.4`

</details>

**Latest Version**: `0.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +scryer.pl@0.10.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['Scryer Prolog']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/scryer.pl/package.yml)
- [Homepage](https://www.scryer.pl)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
