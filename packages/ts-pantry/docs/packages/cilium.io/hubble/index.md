# hubble

> Hubble - Network, Service & Security Observability for Kubernetes using eBPF

## Package Information

- **Domain**: `cilium.io/hubble`
- **Name**: `hubble`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/cilium.io/hubble/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install cilium.io/hubble
```

## Programs

This package provides the following executable programs:

- `hubble`

## Available Versions

<details>
<summary>Show all 19 versions</summary>

- `1.18.5`, `1.18.3`, `1.18.0`, `1.17.5`, `1.17.3`
- `1.17.2`, `1.17.1`, `1.17.0`, `1.16.6`, `1.16.5`
- `1.16.4`, `1.16.3`, `1.16.2`, `1.16.1`, `1.16.0`
- `0.13.6`, `0.13.5`, `0.13.4`, `0.13.3`

</details>

**Latest Version**: `1.18.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +cilium.io/hubble@1.18.5 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.hubble

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/cilium.io/hubble/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
