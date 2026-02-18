# lynx

> Text-based web browser

## Package Information

- **Domain**: `invisible-island.net/lynx`
- **Name**: `lynx`
- **Homepage**: <https://invisible-island.net/lynx/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/invisible-island.net/lynx/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install invisible-island.net/lynx
```

## Programs

This package provides the following executable programs:

- `lynx`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.9.2`

</details>

**Latest Version**: `2.9.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +invisible-island.net/lynx@2.9.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^3`
- `invisible-island.net/ncurses^6`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.lynx

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/invisible-island.net/lynx/package.yml)
- [Homepage](https://invisible-island.net/lynx/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
