# amber

> Crystal web framework. Bare metal performance, productivity and happiness

## Package Information

- **Domain**: `amber-lang.com`
- **Name**: `amber`
- **Homepage**: <https://amberframework.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/amber-lang.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install amber-lang.com
```

## Programs

This package provides the following executable programs:

- `amber`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `0.5.1`, `0.5.0`, `0.4.0`, `0.3.5`, `0.3.4`
- `0.3.3`, `0.3.2`, `0.3.1`

</details>

**Latest Version**: `0.5.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +amber-lang.com@0.5.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.amber

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/amber-lang.com/package.yml)
- [Homepage](https://amberframework.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
