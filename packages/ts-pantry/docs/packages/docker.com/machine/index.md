# docker-machine

> Create Docker hosts locally and on cloud providers

## Package Information

- **Domain**: `docker.com/machine`
- **Name**: `docker-machine`
- **Homepage**: https://docs.gitlab.com/runner/executors/docker_machine.html
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/docker.com/machine/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install docker.com/machine
```

## Programs

This package provides the following executable programs:

- `docker-machine`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.16.2`

</details>

**Latest Version**: `0.16.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +docker.com/machine@0.16.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['docker-machine']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/docker.com/machine/package.yml)
- [Homepage](https://docs.gitlab.com/runner/executors/docker_machine.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
