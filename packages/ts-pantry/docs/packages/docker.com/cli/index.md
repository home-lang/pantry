# docker/cli

> Pack, ship and run any application as a lightweight container

## Package Information

- **Domain**: `docker.com/cli`
- **Name**: `docker/cli`
- **Homepage**: https://www.docker.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/docker.com/cli/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install docker.com/cli
```

## Programs

This package provides the following executable programs:

- `docker`

## Available Versions

<details>
<summary>Show all 71 versions</summary>

- `29.1.5`, `29.1.4`, `29.1.3`, `29.1.2`, `29.1.1`
- `29.1.0`, `29.0.4`, `29.0.3`, `29.0.2`, `29.0.1`
- `28.5.2`, `28.5.1`, `28.5.0`, `28.4.0`, `28.3.3`
- `28.3.2`, `28.3.1`, `28.3.0`, `28.2.2`, `28.2.1`
- `28.2.0`, `28.1.1`, `28.1.0`, `28.0.4`, `28.0.3`
- `28.0.2`, `28.0.1`, `28.0.0`, `27.5.1`, `27.5.0`
- `27.4.1`, `27.4.0`, `27.3.1`, `27.3.0`, `27.2.1`
- `27.2.0`, `27.1.2`, `27.1.1`, `27.1.0`, `27.0.3`
- `27.0.2`, `27.0.1`, `26.1.5`, `26.1.4`, `26.1.3`
- `26.1.2`, `26.1.1`, `26.1.0`, `26.0.2`, `26.0.1`
- `26.0.0`, `25.0.7`, `25.0.6`, `25.0.5`, `25.0.4`
- `25.0.3`, `25.0.2`, `25.0.1`, `25.0.0`, `24.0.9`
- `24.0.8`, `24.0.7`, `24.0.6`, `24.0.5`, `23.0.15`
- `23.0.10`, `23.0.9`, `23.0.8`, `23.0.7`, `20.10.27`
- `20.10.26`

</details>

**Latest Version**: `29.1.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +docker.com/cli@29.1.5 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['docker/cli']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/docker.com/cli/package.yml)
- [Homepage](https://www.docker.com/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
