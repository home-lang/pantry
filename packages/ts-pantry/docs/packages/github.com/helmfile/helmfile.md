# helmfile

> Declaratively deploy your Kubernetes manifests, Kustomize configs, and Charts as Helm releases. Generate all-in-one manifests for use with ArgoCD.

## Package Information

- **Domain**: `github.com/helmfile/helmfile`
- **Name**: `helmfile`
- **Homepage**: https://helmfile.readthedocs.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/helmfile/helmfile/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/helmfile/helmfile
```

## Programs

This package provides the following executable programs:

- `helmfile`

## Available Versions

<details>
<summary>Show all 36 versions</summary>

- `1.2.3`, `1.2.2`, `1.2.1`, `1.2.0`, `1.1.9`
- `1.1.8`, `1.1.7`, `1.1.6`, `1.1.5`, `1.1.4`
- `1.1.3`, `1.1.2`, `1.1.1`, `1.1.0`, `1.0.0`
- `0.171.0`, `0.170.1`, `0.170.0`, `0.169.2`, `0.169.1`
- `0.169.0`, `0.168.0`, `0.167.1`, `0.167.0`, `0.166.0`
- `0.165.0`, `0.164.0`, `0.163.1`, `0.163.0`, `0.162.0`
- `0.161.0`, `0.160.0`, `0.159.0`, `0.158.1`, `0.158.0`
- `0.157.0`

</details>

**Latest Version**: `1.2.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/helmfile/helmfile@1.2.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.helmfile

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/helmfile/helmfile/package.yml)
- [Homepage](https://helmfile.readthedocs.io)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
