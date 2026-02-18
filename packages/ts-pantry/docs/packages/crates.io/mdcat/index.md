# mdcat

> Show markdown documents on text terminals

## Package Information

- **Domain**: `crates.io/mdcat`
- **Name**: `mdcat`
- **Homepage**: <https://crates.io/crates/mdcat>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/mdcat/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/mdcat
```

## Programs

This package provides the following executable programs:

- `mdcat`

## Available Versions

<details>
<summary>Show all 19 versions</summary>

- `2.7.1`, `2.7.0`
- `2.6.2`, `2.6.1`, `2.6.0`
- `2.5.0`
- `2.4.0`
- `2.3.1`, `2.3.0`
- `2.2.0`
- `2.1.2`, `2.1.1`, `2.1.0`
- `2.0.4`, `2.0.3`, `2.0.2`, `2.0.1`, `2.0.0`
- `1.1.0`

</details>

**Latest Version**: `2.7.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/mdcat@2.7.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `curl.se^8 # since 2.7.0`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mdcat

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/mdcat/package.yml)
- [Homepage](https://crates.io/crates/mdcat)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
