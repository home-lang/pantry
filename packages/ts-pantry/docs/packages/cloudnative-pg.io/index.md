# kubectl-cnpg

> CloudNativePG is a comprehensive platform designed to seamlessly manage PostgreSQL databases within Kubernetes environments, covering the entire operational lifecycle from initial deployment to ongoing maintenance

## Package Information

- **Domain**: `cloudnative-pg.io`
- **Name**: `kubectl-cnpg`
- **Homepage**: https://cloudnative-pg.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/cloudnative-pg.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install cloudnative-pg.io
```

## Programs

This package provides the following executable programs:

- `kubectl-cnpg`

## Available Versions

<details>
<summary>Show all 17 versions</summary>

- `1.28.1`, `1.28.0`, `1.27.3`, `1.27.2`, `1.27.1`
- `1.27.0`, `1.26.3`, `1.26.2`, `1.26.1`, `1.26.0`
- `1.25.4`, `1.25.3`, `1.25.2`, `1.25.1`, `1.25.0`
- `1.24.4`, `1.24.3`

</details>

**Latest Version**: `1.28.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +cloudnative-pg.io@1.28.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['kubectl-cnpg']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/cloudnative-pg.io/package.yml)
- [Homepage](https://cloudnative-pg.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
