# restic

> Fast, efficient and secure backup program

## Package Information

- **Domain**: `restic.net/restic`
- **Name**: `restic`
- **Homepage**: <https://restic.net/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/restic.net/restic/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install restic.net/restic
```

## Programs

This package provides the following executable programs:

- `restic`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `0.18.1`, `0.18.0`
- `0.17.3`, `0.17.2`, `0.17.1`, `0.17.0`
- `0.16.5`, `0.16.4`, `0.16.3`, `0.16.2`

</details>

**Latest Version**: `0.18.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +restic.net/restic@0.18.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.restic

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/restic.net/restic/package.yml)
- [Homepage](https://restic.net/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
