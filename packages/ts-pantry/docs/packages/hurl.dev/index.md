# hurl

> Run and Test HTTP Requests with plain text and curl

## Package Information

- **Domain**: `hurl.dev`
- **Name**: `hurl`
- **Homepage**: <https://hurl.dev>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/hurl.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install hurl.dev
```

## Programs

This package provides the following executable programs:

- `hurl`
- `hurlfmt`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `7.1.0`
- `7.0.0`
- `6.1.1`, `6.1.0`
- `6.0.0`
- `5.0.1`, `5.0.0`
- `4.3.0`
- `4.2.0`
- `4.1.0`
- `4.0.0`

</details>

**Latest Version**: `7.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +hurl.dev@7.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/libxml2~2.13 # 2.14 changed the API`
- `curl.se`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.hurl

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/hurl.dev/package.yml)
- [Homepage](https://hurl.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
