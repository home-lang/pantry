# KeePassXC

> A cross-platform community-driven password manager.

## Package Information

- **Domain**: `keepassxc.org`
- **Name**: `KeePassXC`
- **Homepage**: <https://keepassxc.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/keepassxc.org/package.yml)

## Installation

```bash
# Install with pantry
pantry install keepassxc.org
```

## Programs

This package provides the following executable programs:

- `keepassxc`

## Aliases

This package can also be accessed using these aliases:

- `keepassxc`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.7.9`, `2.7.8`

</details>

**Latest Version**: `2.7.9`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +keepassxc.org@2.7.9 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.keepassxc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/keepassxc.org/package.yml)
- [Homepage](https://keepassxc.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
