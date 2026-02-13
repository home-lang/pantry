# fish

> User-friendly command-line shell for UNIX-like operating systems

## Package Information

- **Domain**: `fishshell.com`
- **Name**: `fish`
- **Homepage**: https://fishshell.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/fishshell.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install fishshell.com
```

## Programs

This package provides the following executable programs:

- `fish`
- `fish_indent`
- `fish_key_reader`

## Available Versions

<details>
<summary>Show all 23 versions</summary>

- `4.3.3`, `4.3.2`, `4.3.1`, `4.3.0`, `4.2.1`
- `4.2.0`, `4.1.2`, `4.1.1`, `4.1.0`, `4.0.9`
- `4.0.8`, `4.0.6`, `4.0.2`, `4.0.1`, `4.0.0`
- `3.7.1`, `3.7.0`, `3.6.4`, `3.6.3`, `3.6.2`
- `3.6.1`, `3.6.0`, `3.5.1`

</details>

**Latest Version**: `4.3.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +fishshell.com@4.3.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/gettext`
- `invisible-island.net/ncurses>=6.0`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.fish

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/fishshell.com/package.yml)
- [Homepage](https://fishshell.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
