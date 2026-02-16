# kube-linter

> KubeLinter is a static analysis tool that checks Kubernetes YAML files and Helm charts to ensure the applications represented in them adhere to best practices.

## Package Information

- **Domain**: `kubelinter.io`
- **Name**: `kube-linter`
- **Homepage**: https://docs.kubelinter.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/kubelinter.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install kubelinter.io
```

## Programs

This package provides the following executable programs:

- `kube-linter`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `0.8.1`, `0.8.0`, `0.7.6`, `0.7.5`, `0.7.4`
- `0.7.3`, `0.7.2`, `0.7.1`, `0.7.0`, `0.6.8`

</details>

**Latest Version**: `0.8.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +kubelinter.io@0.8.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['kube-linter']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/kubelinter.io/package.yml)
- [Homepage](https://docs.kubelinter.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
