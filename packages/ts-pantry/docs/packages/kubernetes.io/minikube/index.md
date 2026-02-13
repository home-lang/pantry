# minikube

> Run a Kubernetes cluster locally

## Package Information

- **Domain**: `kubernetes.io/minikube`
- **Name**: `minikube`
- **Homepage**: https://minikube.sigs.k8s.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/kubernetes.io/minikube/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install kubernetes.io/minikube
```

## Programs

This package provides the following executable programs:

- `minikube`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `1.37.0`, `1.36.0`, `1.35.0`, `1.34.0`, `1.33.1`
- `1.33.0`, `1.32.0`, `1.31.2`, `1.31.1`, `1.31.0`
- `1.30.1`, `1.30.0`, `1.29.0`

</details>

**Latest Version**: `1.37.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +kubernetes.io/minikube@1.37.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `kubernetes.io/kubectl`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.minikube

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/kubernetes.io/minikube/package.yml)
- [Homepage](https://minikube.sigs.k8s.io/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
