# render

> Command-line interface for Render

## Package Information

- **Domain**: `render.com`
- **Name**: `render`
- **Homepage**: https://render.com/docs/cli
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/render.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install render.com
```

## Programs

This package provides the following executable programs:

- `render`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.1.11`, `0.1.10`, `0.1.9`, `0.1.8`, `0.1.7`, `0.1.5`

</details>

**Latest Version**: `0.1.11`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +render.com@0.1.11 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.render

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/render.com/package.yml)
- [Homepage](https://render.com/docs/cli)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
