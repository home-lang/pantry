# kaggle

> Official Kaggle API

## Package Information

- **Domain**: `kaggle.com`
- **Name**: `kaggle`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/kaggle.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install kaggle.com
```

## Programs

This package provides the following executable programs:

- `kaggle`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `1.7.4.5`, `1.7.4.2`
- `1.6.3`, `1.6.1`
- `1.5.16`

</details>

**Latest Version**: `1.7.4.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +kaggle.com@1.7.4.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.kaggle

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/kaggle.com/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
