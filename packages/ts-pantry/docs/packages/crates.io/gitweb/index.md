# gitweb

> 🌲 Open the current remote repository in your browser

## Package Information

- **Domain**: `crates.io/gitweb`
- **Name**: `gitweb`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/gitweb/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/gitweb
```

## Programs

This package provides the following executable programs:

- `gitweb`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.3.5`

</details>

**Latest Version**: `0.3.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/gitweb@0.3.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gitweb

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/gitweb/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
