# dive

> A tool for exploring each layer in a docker image

## Package Information

- **Domain**: `github.com/wagoodman/dive`
- **Name**: `dive`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/wagoodman/dive/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/wagoodman/dive
```

## Programs

This package provides the following executable programs:

- `dive`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `0.13.1`, `0.13.0`, `0.12.0`, `0.11.0`

</details>

**Latest Version**: `0.13.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/wagoodman/dive@0.13.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.dive

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/wagoodman/dive/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
