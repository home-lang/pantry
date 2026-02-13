# copa

> Tool to directly patch container images given the vulnerability scanning results

## Package Information

- **Domain**: `project-copacetic.github.io`
- **Name**: `copa`
- **Homepage**: https://project-copacetic.github.io/copacetic/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/project-copacetic.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install project-copacetic.github.io
```

## Programs

This package provides the following executable programs:

- `copa`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `0.13.0`, `0.12.0`, `0.11.1`, `0.11.0`, `0.10.0`
- `0.9.0`, `0.8.0`, `0.7.0`, `0.6.2`

</details>

**Latest Version**: `0.13.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +project-copacetic.github.io@0.13.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.copa

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/project-copacetic.github.io/package.yml)
- [Homepage](https://project-copacetic.github.io/copacetic/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
