# argo-workflows

> Get stuff done with container-native workflows for Kubernetes

## Package Information

- **Domain**: `argoproj.github.io/workflows`
- **Name**: `argo-workflows`
- **Homepage**: https://argoproj.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/argoproj.github.io/workflows/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install argoproj.github.io/workflows
```

## Programs

This package provides the following executable programs:

- `argo`

## Available Versions

<details>
<summary>Show all 50 versions</summary>

- `3.7.8`, `3.7.7`, `3.7.6`, `3.7.5`, `3.7.4`
- `3.7.3`, `3.7.2`, `3.7.1`, `3.7.0`, `3.6.17`
- `3.6.16`, `3.6.15`, `3.6.13`, `3.6.12`, `3.6.11`
- `3.6.10`, `3.6.9`, `3.6.8`, `3.6.7`, `3.6.6`
- `3.6.5`, `3.6.4`, `3.6.3`, `3.6.2`, `3.6.1`
- `3.6.0`, `3.5.15`, `3.5.14`, `3.5.13`, `3.5.12`
- `3.5.11`, `3.5.10`, `3.5.9`, `3.5.8`, `3.5.7`
- `3.5.6`, `3.5.5`, `3.5.4`, `3.5.3`, `3.5.2`
- `3.5.1`, `3.5.0`, `3.4.18`, `3.4.17`, `3.4.16`
- `3.4.15`, `3.4.14`, `3.4.13`, `3.4.12`, `3.4.11`

</details>

**Latest Version**: `3.7.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +argoproj.github.io/workflows@3.7.8 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['argo-workflows']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/argoproj.github.io/workflows/package.yml)
- [Homepage](https://argoproj.io)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
