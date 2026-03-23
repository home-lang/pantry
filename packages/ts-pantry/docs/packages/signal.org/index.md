# Signal

> A private messenger for encrypted communications.

## Package Information

- **Domain**: `signal.org`
- **Name**: `Signal`
- **Homepage**: <https://signal.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/signal.org/package.yml)

## Installation

```bash
# Install with pantry
pantry install signal.org
```

## Programs

This package provides the following executable programs:

- `signal`

## Aliases

This package can also be accessed using these aliases:

- `signal`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `7.36.0`
- `7.35.0`

</details>

**Latest Version**: `7.36.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +signal.org@7.36.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.signal

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/signal.org/package.yml)
- [Homepage](https://signal.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
