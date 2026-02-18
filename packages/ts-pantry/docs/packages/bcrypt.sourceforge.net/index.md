# bcrypt

> Cross platform file encryption utility using blowfish

## Package Information

- **Domain**: `bcrypt.sourceforge.net`
- **Name**: `bcrypt`
- **Homepage**: <https://bcrypt.sourceforge.net/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/bcrypt.sourceforge.net/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install bcrypt.sourceforge.net
```

## Programs

This package provides the following executable programs:

- `bcrypt`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.1.0`

</details>

**Latest Version**: `1.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +bcrypt.sourceforge.net@1.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bcrypt

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/bcrypt.sourceforge.net/package.yml)
- [Homepage](https://bcrypt.sourceforge.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
