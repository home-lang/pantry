# pkg-config

> package compiler and linker metadata toolkit

## Package Information

- **Domain**: `freedesktop.org/pkg-config`
- **Name**: `pkg-config`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/pkg-config/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install freedesktop.org/pkg-config
```

## Programs

This package provides the following executable programs:

- `pkg-config`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.29.2`

</details>

**Latest Version**: `0.29.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +freedesktop.org/pkg-config@0.29.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['pkg-config']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/pkg-config/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
