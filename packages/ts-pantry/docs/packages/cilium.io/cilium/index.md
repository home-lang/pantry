# cilium

> CLI to install, manage & troubleshoot Kubernetes clusters running Cilium

## Package Information

- **Domain**: `cilium.io/cilium`
- **Name**: `cilium`
- **Homepage**: https://cilium.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/cilium.io/cilium/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install cilium.io/cilium
```

## Programs

This package provides the following executable programs:

- `cilium`

## Available Versions

<details>
<summary>Show all 31 versions</summary>

- `0.19.0`, `0.18.9`, `0.18.8`, `0.18.7`, `0.18.6`
- `0.18.5`, `0.18.4`, `0.18.3`, `0.18.2`, `0.18.1`
- `0.18.0`, `0.17.0`, `0.16.24`, `0.16.23`, `0.16.22`
- `0.16.21`, `0.16.20`, `0.16.19`, `0.16.18`, `0.16.17`
- `0.16.16`, `0.16.15`, `0.16.14`, `0.16.13`, `0.16.12`
- `0.16.11`, `0.16.10`, `0.16.9`, `0.16.8`, `0.16.7`
- `0.16.6`

</details>

**Latest Version**: `0.19.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +cilium.io/cilium@0.19.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cilium

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/cilium.io/cilium/package.yml)
- [Homepage](https://cilium.io)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
