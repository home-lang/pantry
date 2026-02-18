# woff2

> Utilities to create and convert Web Open Font File (WOFF) files

## Package Information

- **Domain**: `google.com/woff2`
- **Name**: `woff2`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/google.com/woff2/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install google.com/woff2
```

## Programs

This package provides the following executable programs:

- `woff2_info`
- `woff2_decompress`
- `woff2_compress`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.0.2`

</details>

**Latest Version**: `1.0.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +google.com/woff2@1.0.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/google/brotli`
- `linux:gnu.org/gcc`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.woff2

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/google.com/woff2/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
