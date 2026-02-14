# nnn

> Tiny, lightning fast, feature-packed file manager

## Package Information

- **Domain**: `github.com/jarun/nnn`
- **Name**: `nnn`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jarun/nnn/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/jarun/nnn
```

## Programs

This package provides the following executable programs:

- `nnn`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `5.2.0`, `5.1.0`, `5.0.0`

</details>

**Latest Version**: `5.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/jarun/nnn@5.2.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `invisible-island.net/ncurses@6`
- `gnu.org/readline@8`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.nnn

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jarun/nnn/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
