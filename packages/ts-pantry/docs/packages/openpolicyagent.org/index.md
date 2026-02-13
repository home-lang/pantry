# opa

> Open Policy Agent (OPA) is an open source, general-purpose policy engine.

## Package Information

- **Domain**: `openpolicyagent.org`
- **Name**: `opa`
- **Homepage**: https://www.openpolicyagent.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openpolicyagent.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openpolicyagent.org
```

## Programs

This package provides the following executable programs:

- `opa`

## Available Versions

<details>
<summary>Show all 39 versions</summary>

- `1.12.3`, `1.12.2`, `1.12.1`, `1.12.0`, `1.11.1`
- `1.11.0`, `1.10.1`, `1.10.0`, `1.9.0`, `1.8.0`
- `1.7.1`, `1.7.0`, `1.6.0`, `1.5.1`, `1.5.0`
- `1.4.2`, `1.4.1`, `1.4.0`, `1.3.0`, `1.2.0`
- `1.1.0`, `1.0.1`, `1.0.0`, `0.70.0`, `0.69.0`
- `0.68.0`, `0.67.1`, `0.67.0`, `0.66.0`, `0.65.0`
- `0.64.1`, `0.64.0`, `0.63.0`, `0.62.1`, `0.62.0`
- `0.61.0`, `0.60.0`, `0.59.0`, `0.58.0`

</details>

**Latest Version**: `1.12.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openpolicyagent.org@1.12.3 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.opa

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openpolicyagent.org/package.yml)
- [Homepage](https://www.openpolicyagent.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
