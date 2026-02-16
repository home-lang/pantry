# hx

> A post-modern modal text editor.

## Package Information

- **Domain**: `helix-editor.com`
- **Name**: `hx`
- **Homepage**: <https://helix-editor.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/helix-editor.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install helix-editor.com
```

## Programs

This package provides the following executable programs:

- `hx`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `25.7.1`, `25.7.0`, `25.1.1`, `25.1.0`, `24.7.0`
- `24.3.0`, `23.10.0`, `23.5.0`, `23.3.0`, `22.12.0`

</details>

**Latest Version**: `25.7.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +helix-editor.com@25.7.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.hx

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/helix-editor.com/package.yml)
- [Homepage](https://helix-editor.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
