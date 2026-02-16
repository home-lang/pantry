# kluctl

> The missing glue to put together large Kubernetes deployments, composed of multiple smaller parts (Helm/Kustomize/...) in a manageable and unified way.

## Package Information

- **Domain**: `kluctl.io`
- **Name**: `kluctl`
- **Homepage**: <https://kluctl.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/kluctl.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install kluctl.io
```

## Programs

This package provides the following executable programs:

- `kluctl`

## Available Versions

<details>
<summary>Show all 15 versions</summary>

- `2.27.0`, `2.26.0`, `2.25.1`, `2.25.0`, `2.24.1`
- `2.24.0`, `2.23.5`, `2.23.4`, `2.23.3`, `2.23.2`
- `2.23.1`, `2.23.0`, `2.22.1`, `2.22.0`, `2.21.2`

</details>

**Latest Version**: `2.27.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +kluctl.io@2.27.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.kluctl

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/kluctl.io/package.yml)
- [Homepage](https://kluctl.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
