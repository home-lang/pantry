# lporg

> Organize Your macOS Launchpad Apps

## Package Information

- **Domain**: `github.com/blacktop/lporg`
- **Name**: `lporg`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/blacktop/lporg/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/blacktop/lporg
```

## Programs

This package provides the following executable programs:

- `lporg`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `20.4.32`

</details>

**Latest Version**: `20.4.32`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/blacktop/lporg@20.4.32 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.lporg

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/blacktop/lporg/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
