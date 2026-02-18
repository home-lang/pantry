# ctop

> Top-like interface for container metrics

## Package Information

- **Domain**: `ctop.sh`
- **Name**: `ctop`
- **Homepage**: <https://bcicen.github.io/ctop/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ctop.sh/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ctop.sh
```

## Programs

This package provides the following executable programs:

- `ctop`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.7.7`

</details>

**Latest Version**: `0.7.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ctop.sh@0.7.7 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ctop

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ctop.sh/package.yml)
- [Homepage](https://bcicen.github.io/ctop/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
