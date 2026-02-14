# kustomize

> Template-free customization of Kubernetes YAML manifests

## Package Information

- **Domain**: `kubernetes.io/kustomize`
- **Name**: `kustomize`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/kubernetes.io/kustomize/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install kubernetes.io/kustomize
```

## Programs

This package provides the following executable programs:

- `kustomize`

## Available Versions

<details>
<summary>Show all 18 versions</summary>

- `5.8.1`, `5.8.0`, `5.7.1`, `5.7.0`, `5.6.0`
- `5.5.0`, `5.4.3`, `5.4.2`, `5.4.1`, `5.4.0`
- `5.3.0`, `5.2.1`, `5.2.0`, `5.1.1`, `5.1.0`
- `5.0.3`, `5.0.2`, `5.0.1`

</details>

**Latest Version**: `5.8.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +kubernetes.io/kustomize@5.8.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `kubernetes.io/kubectl`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.kustomize

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/kubernetes.io/kustomize/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
