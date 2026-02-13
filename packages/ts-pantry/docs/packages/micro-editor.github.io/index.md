# micro

> A modern and intuitive terminal-based text editor

## Package Information

- **Domain**: `micro-editor.github.io`
- **Name**: `micro`
- **Homepage**: https://micro-editor.github.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/micro-editor.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install micro-editor.github.io
```

## Programs

This package provides the following executable programs:

- `micro`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `2.0.15`, `2.0.14`, `2.0.13`, `2.0.12`, `2.0.11`

</details>

**Latest Version**: `2.0.15`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +micro-editor.github.io@2.0.15 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.micro

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/micro-editor.github.io/package.yml)
- [Homepage](https://micro-editor.github.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
