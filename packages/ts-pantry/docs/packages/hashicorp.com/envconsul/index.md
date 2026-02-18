# envconsul

> Launch a subprocess with environment variables using data from @HashiCorp Consul and Vault.

## Package Information

- **Domain**: `hashicorp.com/envconsul`
- **Name**: `envconsul`
- **Homepage**: <https://www.hashicorp.com/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/hashicorp.com/envconsul/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install hashicorp.com/envconsul
```

## Programs

This package provides the following executable programs:

- `envconsul`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.13.4`, `0.13.3`, `0.13.2`

</details>

**Latest Version**: `0.13.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +hashicorp.com/envconsul@0.13.4 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.envconsul

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/hashicorp.com/envconsul/package.yml)
- [Homepage](https://www.hashicorp.com/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
