# juju

> Orchestration engine that enables the deployment, integration and lifecycle management of applications at any scale, on any infrastructure (Kubernetes or otherwise).

## Package Information

- **Domain**: `juju.is`
- **Name**: `juju`
- **Homepage**: https://juju.is/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/juju.is/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install juju.is
```

## Programs

This package provides the following executable programs:

- `juju`

## Available Versions

<details>
<summary>Show all 27 versions</summary>

- `4.0.1`, `4.0.0`, `3.6.13`, `3.6.12`, `3.6.11`
- `3.6.10`, `3.6.9`, `3.6.8`, `3.6.7`, `3.6.6`
- `3.6.5`, `3.6.4`, `3.6.3`, `3.6.2`, `3.6.1`
- `3.6.0`, `3.5.7`, `3.5.6`, `3.5.5`, `3.5.4`
- `3.5.3`, `3.4.6`, `3.3.7`, `3.1.10`, `2.9.53`
- `2.9.52`, `2.9.51`

</details>

**Latest Version**: `4.0.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +juju.is@4.0.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.juju

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/juju.is/package.yml)
- [Homepage](https://juju.is/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
