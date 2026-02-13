# consul-template

> Template rendering, notifier, and supervisor for @HashiCorp Consul and Vault data.

## Package Information

- **Domain**: `hashicorp.com/consul-template`
- **Name**: `consul-template`
- **Homepage**: https://www.hashicorp.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/hashicorp.com/consul-template/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install hashicorp.com/consul-template
```

## Programs

This package provides the following executable programs:

- `consul-template`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `0.41.3`, `0.41.2`, `0.41.1`, `0.41.0`, `0.40.0`
- `0.39.1`, `0.39.0`

</details>

**Latest Version**: `0.41.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +hashicorp.com/consul-template@0.41.3 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['consul-template']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/hashicorp.com/consul-template/package.yml)
- [Homepage](https://www.hashicorp.com/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
