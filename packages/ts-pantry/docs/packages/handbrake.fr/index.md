# HandBrake

> An open-source video transcoder.

## Package Information

- **Domain**: `handbrake.fr`
- **Name**: `HandBrake`
- **Homepage**: <https://handbrake.fr>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/handbrake.fr/package.yml)

## Installation

```bash
# Install with pantry
pantry install handbrake.fr
```

## Programs

This package provides the following executable programs:

- `handbrake`

## Aliases

This package can also be accessed using these aliases:

- `handbrake`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.9.0`
- `1.8.2`, `1.8.1`

</details>

**Latest Version**: `1.9.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +handbrake.fr@1.9.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.handbrake

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/handbrake.fr/package.yml)
- [Homepage](https://handbrake.fr)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
