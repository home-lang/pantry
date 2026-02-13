# lsd

> Clone of ls with colorful output, file type icons, and more

## Package Information

- **Domain**: `github.com/peltoche/lsd`
- **Name**: `lsd`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/peltoche/lsd/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/peltoche/lsd
```

## Programs

This package provides the following executable programs:

- `lsd`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `1.2.0`, `1.1.5`, `1.1.3`, `1.1.2`, `1.1.1`
- `1.1.0`, `1.0.0`, `0.23.1`

</details>

**Latest Version**: `1.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/peltoche/lsd@1.2.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgit2.org~1.7`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.lsd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/peltoche/lsd/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
