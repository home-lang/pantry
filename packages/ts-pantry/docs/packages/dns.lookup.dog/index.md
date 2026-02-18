# dog

> A command-line DNS client.

## Package Information

- **Domain**: `dns.lookup.dog`
- **Name**: `dog`
- **Homepage**: <https://dns.lookup.dog/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/dns.lookup.dog/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install dns.lookup.dog
```

## Programs

This package provides the following executable programs:

- `dog`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.1.0`

</details>

**Latest Version**: `0.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +dns.lookup.dog@0.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.dog

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/dns.lookup.dog/package.yml)
- [Homepage](https://dns.lookup.dog/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
