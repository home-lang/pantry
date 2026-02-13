# glew.sourceforge

> The OpenGL Extension Wrangler Library

## Package Information

- **Domain**: `glew.sourceforge.io`
- **Name**: `glew.sourceforge`
- **Homepage**: https://glew.sourceforge.net/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/glew.sourceforge.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install glew.sourceforge.io
```

## Programs

This package provides the following executable programs:

- `glewinfo`
- `visualinfo`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.3.0`, `2.2.0`

</details>

**Latest Version**: `2.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +glew.sourceforge.io@2.3.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['glew.sourceforge']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/glew.sourceforge.io/package.yml)
- [Homepage](https://glew.sourceforge.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
