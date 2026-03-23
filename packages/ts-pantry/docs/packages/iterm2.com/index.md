# iTerm2

> A terminal emulator for macOS with advanced features.

## Package Information

- **Domain**: `iterm2.com`
- **Name**: `iTerm2`
- **Homepage**: <https://iterm2.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/iterm2.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install iterm2.com
```

## Programs

This package provides the following executable programs:

- `iterm2`

## Aliases

This package can also be accessed using these aliases:

- `iterm`
- `iterm2`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `3.5.6`, `3.5.5`, `3.5.4`

</details>

**Latest Version**: `3.5.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +iterm2.com@3.5.6 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.iterm

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/iterm2.com/package.yml)
- [Homepage](https://iterm2.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
