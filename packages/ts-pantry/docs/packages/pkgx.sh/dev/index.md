# dev

> isolated `dev` environments

## Package Information

- **Domain**: `pkgx.sh/dev`
- **Name**: `dev`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pkgx.sh/dev
```

## Programs

This package provides the following executable programs:

- `dev`

## Available Versions

<details>
<summary>Show all 12 versions</summary>

- `1.8.1`, `1.8.0`
- `1.7.0`
- `1.6.0`
- `1.5.0`
- `1.4.0`
- `1.3.0`
- `1.2.0`
- `1.1.0`
- `1.0.2`, `1.0.1`, `1.0.0`

</details>

**Latest Version**: `1.8.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pkgx.sh/dev@1.8.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1,^2.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.dev

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/dev/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
