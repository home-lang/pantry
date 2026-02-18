# hunspell

> Spell checker and morphological analyzer

## Package Information

- **Domain**: `hunspell.github.io`
- **Name**: `hunspell`
- **Homepage**: <https://hunspell.github.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/hunspell.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install hunspell.github.io
```

## Programs

This package provides the following executable programs:

- `analyze`
- `chmorph`
- `hunspell`
- `hunzip`
- `hzip`
- `munch`
- `unmunch`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.7.2`

</details>

**Latest Version**: `1.7.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +hunspell.github.io@1.7.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/readline`
- `invisible-island.net/ncurses`
- `gnu.org/gettext`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.hunspell

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/hunspell.github.io/package.yml)
- [Homepage](https://hunspell.github.io)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
