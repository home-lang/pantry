# docker-compose

> Define and run multi-container applications with Docker

## Package Information

- **Domain**: `docker.com/compose`
- **Name**: `docker-compose`
- **Homepage**: https://docs.docker.com/compose/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/docker.com/compose/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install docker.com/compose
```

## Programs

This package provides the following executable programs:

- `docker-compose`

## Available Versions

<details>
<summary>Show all 69 versions</summary>

- `5.0.2`, `5.0.1`, `5.0.0`, `2.40.3`, `2.40.2`
- `2.40.1`, `2.40.0`, `2.39.4`, `2.39.3`, `2.39.2`
- `2.39.1`, `2.39.0`, `2.38.2`, `2.38.1`, `2.38.0`
- `2.37.3`, `2.37.2`, `2.37.1`, `2.37.0`, `2.36.2`
- `2.36.1`, `2.36.0`, `2.35.1`, `2.35.0`, `2.34.0`
- `2.33.1`, `2.33.0`, `2.32.4`, `2.32.3`, `2.32.2`
- `2.32.1`, `2.32.0`, `2.31.0`, `2.30.3`, `2.30.2`
- `2.30.1`, `2.30.0`, `2.29.7`, `2.29.6`, `2.29.5`
- `2.29.4`, `2.29.3`, `2.29.2`, `2.29.1`, `2.29.0`
- `2.28.1`, `2.27.3`, `2.27.2`, `2.27.1`, `2.27.0`
- `2.26.1`, `2.26.0`, `2.25.0`, `2.24.7`, `2.24.6`
- `2.24.5`, `2.24.4`, `2.24.3`, `2.24.2`, `2.24.1`
- `2.24.0`, `2.23.3`, `2.23.2`, `2.23.1`, `2.23.0`
- `2.22.0`, `2.21.0`, `2.20.3`, `2.20.2`

</details>

**Latest Version**: `5.0.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +docker.com/compose@5.0.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['docker-compose']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/docker.com/compose/package.yml)
- [Homepage](https://docs.docker.com/compose/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
