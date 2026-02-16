# linkerd

> Ultralight, security-first service mesh for Kubernetes. Main repo for Linkerd 2.x.

## Package Information

- **Domain**: `linkerd.io/linkerd2`
- **Name**: `linkerd`
- **Homepage**: <https://linkerd.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/linkerd.io/linkerd2/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install linkerd.io/linkerd2
```

## Programs

This package provides the following executable programs:

- `linkerd`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `2.14.10`, `2.14.9`, `2.14.8`, `2.14.7`, `2.14.6`
- `2.14.5`, `2.14.4`, `2.14.3`, `2.14.2`

</details>

**Latest Version**: `2.14.10`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +linkerd.io/linkerd2@2.14.10 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.linkerd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/linkerd.io/linkerd2/package.yml)
- [Homepage](https://linkerd.io)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
