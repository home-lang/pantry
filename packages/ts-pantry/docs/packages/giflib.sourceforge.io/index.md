# gif

> Library and utilities for processing GIFs

## Package Information

- **Domain**: `giflib.sourceforge.io`
- **Name**: `gif`
- **Homepage**: <https://giflib.sourceforge.net/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/giflib.sourceforge.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install giflib.sourceforge.io
```

## Programs

This package provides the following executable programs:

- `gif2rgb`
- `gifbuild`
- `gifclrmp`
- `giffix`
- `giftext`
- `giftool`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `5.2.2`, `5.2.1`

</details>

**Latest Version**: `5.2.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +giflib.sourceforge.io@5.2.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gif

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/giflib.sourceforge.io/package.yml)
- [Homepage](https://giflib.sourceforge.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
