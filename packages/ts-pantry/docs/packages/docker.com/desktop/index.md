# Docker Desktop

> A desktop application for building and sharing containerized applications.

## Package Information

- **Domain**: `docker.com/desktop`
- **Name**: `Docker Desktop`
- **Homepage**: <https://docker.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/docker.com/desktop/package.yml)

## Installation

```bash
# Install with pantry
pantry install docker.com/desktop
```

## Programs

This package provides the following executable programs:

- `docker-desktop`

## Aliases

This package can also be accessed using these aliases:

- `docker-desktop`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `4.37.2`, `4.37.1`, `4.37.0`

</details>

**Latest Version**: `4.37.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +docker.com/desktop@4.37.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['docker-desktop']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/docker.com/desktop/package.yml)
- [Homepage](https://docker.com)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
