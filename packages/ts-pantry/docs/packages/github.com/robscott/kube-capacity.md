# kube-capacity

> A simple CLI that provides an overview of the resource requests, limits, and utilization in a Kubernetes cluster

## Package Information

- **Domain**: `github.com/robscott/kube-capacity`
- **Name**: `kube-capacity`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/robscott/kube-capacity/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/robscott/kube-capacity
```

## Programs

This package provides the following executable programs:

- `kube-capacity`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.8.0`

</details>

**Latest Version**: `0.8.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/robscott/kube-capacity@0.8.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['kube-capacity']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/robscott/kube-capacity/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
