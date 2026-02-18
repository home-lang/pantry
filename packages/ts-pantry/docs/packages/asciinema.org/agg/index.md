# agg

> Asciicast to GIF converter

## Package Information

- **Domain**: `asciinema.org/agg`
- **Name**: `agg`
- **Homepage**: <https://docs.asciinema.org/manual/agg/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/asciinema.org/agg/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install asciinema.org/agg
```

## Programs

This package provides the following executable programs:

- `agg`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.7.0`
- `1.6.0`
- `1.5.0`
- `1.4.3`

</details>

**Latest Version**: `1.7.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +asciinema.org/agg@1.7.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `rust-lang.org^1.56`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.agg

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/asciinema.org/agg/package.yml)
- [Homepage](https://docs.asciinema.org/manual/agg/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
