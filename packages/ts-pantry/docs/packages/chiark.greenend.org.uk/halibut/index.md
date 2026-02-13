# halibut

> Yet another free document preparation system

## Package Information

- **Domain**: `chiark.greenend.org.uk/halibut`
- **Name**: `halibut`
- **Homepage**: https://www.chiark.greenend.org.uk/~sgtatham/halibut/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/chiark.greenend.org.uk/halibut/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install chiark.greenend.org.uk/halibut
```

## Programs

This package provides the following executable programs:

- `halibut`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.3.0`

</details>

**Latest Version**: `1.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +chiark.greenend.org.uk/halibut@1.3.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.halibut

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/chiark.greenend.org.uk/halibut/package.yml)
- [Homepage](https://www.chiark.greenend.org.uk/~sgtatham/halibut/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
