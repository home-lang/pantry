# buildx

> Docker CLI plugin for extended build capabilities with BuildKit

## Package Information

- **Domain**: `docker.com/buildx`
- **Name**: `buildx`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/docker.com/buildx/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install docker.com/buildx
```

## Programs

This package provides the following executable programs:

- `buildx`

## Available Versions

<details>
<summary>Show all 35 versions</summary>

- `0.31.0`, `0.30.1`, `0.30.0`, `0.29.1`, `0.29.0`
- `0.28.0`, `0.27.0`, `0.26.1`, `0.26.0`, `0.25.0`
- `0.24.0`, `0.23.0`, `0.22.0`, `0.21.3`, `0.21.2`
- `0.21.1`, `0.21.0`, `0.20.1`, `0.20.0`, `0.19.3`
- `0.19.2`, `0.19.1`, `0.19.0`, `0.18.0`, `0.17.1`
- `0.17.0`, `0.16.2`, `0.16.1`, `0.16.0`, `0.15.1`
- `0.15.0`, `0.14.1`, `0.14.0`, `0.13.1`, `0.13.0`

</details>

**Latest Version**: `0.31.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +docker.com/buildx@0.31.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.buildx

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/docker.com/buildx/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
