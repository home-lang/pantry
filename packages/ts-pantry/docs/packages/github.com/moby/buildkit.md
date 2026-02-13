# buildkit

> concurrent, cache-efficient, and Dockerfile-agnostic builder toolkit

## Package Information

- **Domain**: `github.com/moby/buildkit`
- **Name**: `buildkit`
- **Homepage**: https://github.com/moby/moby/issues/34227
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/moby/buildkit/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/moby/buildkit
```

## Programs

This package provides the following executable programs:

- `buildctl`

## Available Versions

<details>
<summary>Show all 37 versions</summary>

- `0.27.0`, `0.26.3`, `0.26.2`, `0.26.1`, `0.26.0`
- `0.25.2`, `0.25.1`, `0.25.0`, `0.24.0`, `0.23.2`
- `0.23.1`, `0.23.0`, `0.22.0`, `0.21.1`, `0.21.0`
- `0.20.2`, `0.20.1`, `0.20.0`, `0.19.0`, `0.18.2`
- `0.18.1`, `0.18.0`, `0.17.3`, `0.17.2`, `0.17.1`
- `0.17.0`, `0.16.0`, `0.15.2`, `0.15.1`, `0.15.0`
- `0.14.1`, `0.14.0`, `0.13.2`, `0.13.1`, `0.13.0`
- `0.12.5`, `0.12.4`

</details>

**Latest Version**: `0.27.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/moby/buildkit@0.27.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.buildkit

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/moby/buildkit/package.yml)
- [Homepage](https://github.com/moby/moby/issues/34227)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
