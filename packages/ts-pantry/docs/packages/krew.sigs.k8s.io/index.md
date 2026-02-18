# kubectl-krew

> 📦 Find and install kubectl plugins

## Package Information

- **Domain**: `krew.sigs.k8s.io`
- **Name**: `kubectl-krew`
- **Homepage**: https://sigs.k8s.io/krew/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/krew.sigs.k8s.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install krew.sigs.k8s.io
```

## Programs

This package provides the following executable programs:

- `kubectl-krew`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.4.5`, `0.4.4`

</details>

**Latest Version**: `0.4.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +krew.sigs.k8s.io@0.4.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `git-scm.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['kubectl-krew']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/krew.sigs.k8s.io/package.yml)
- [Homepage](https://sigs.k8s.io/krew/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
