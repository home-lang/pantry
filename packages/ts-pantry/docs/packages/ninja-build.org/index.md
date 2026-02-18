# ninja

> Small build system for use with gyp or CMake

## Package Information

- **Domain**: `ninja-build.org`
- **Name**: `ninja`
- **Homepage**: <https://ninja-build.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ninja-build.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ninja-build.org
```

## Programs

This package provides the following executable programs:

- `ninja`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `1.13.2`, `1.13.1`, `1.13.0`
- `1.12.1`, `1.12.0`
- `1.11.1`, `1.11.0`

</details>

**Latest Version**: `1.13.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ninja-build.org@1.13.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ninja

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ninja-build.org/package.yml)
- [Homepage](https://ninja-build.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
