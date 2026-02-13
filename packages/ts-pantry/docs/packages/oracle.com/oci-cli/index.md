# oci

> Command Line Interface for Oracle Cloud Infrastructure

## Package Information

- **Domain**: `oracle.com/oci-cli`
- **Name**: `oci`
- **Homepage**: https://docs.cloud.oracle.com/iaas/Content/API/Concepts/cliconcepts.htm
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/oracle.com/oci-cli/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install oracle.com/oci-cli
```

## Programs

This package provides the following executable programs:

- `oci`

## Available Versions

<details>
<summary>Show all 93 versions</summary>

- `3.72.1`, `3.72.0`, `3.71.4`, `3.71.2`, `3.71.1`
- `3.71.0`, `3.70.1`, `3.70.0`, `3.69.0`, `3.68.1`
- `3.68.0`, `3.67.0`, `3.66.2`, `3.66.1`, `3.66.0`
- `3.65.1`, `3.65.0`, `3.64.1`, `3.64.0`, `3.63.3`
- `3.63.2`, `3.63.0`, `3.62.2`, `3.62.1`, `3.62.0`
- `3.61.0`, `3.60.0`, `3.59.0`, `3.58.1`, `3.58.0`
- `3.57.0`, `3.56.1`, `3.56.0`, `3.55.0`, `3.54.6`
- `3.54.5`, `3.54.4`, `3.54.3`, `3.54.2`, `3.54.1`
- `3.54.0`, `3.53.0`, `3.52.1`, `3.52.0`, `3.51.9`
- `3.51.8`, `3.51.7`, `3.51.6`, `3.51.5`, `3.51.4`
- `3.51.3`, `3.51.2`, `3.51.1`, `3.51.0`, `3.50.3`
- `3.50.2`, `3.50.1`, `3.50.0`, `3.49.4`, `3.49.3`
- `3.49.2`, `3.49.1`, `3.49.0`, `3.48.3`, `3.48.2`
- `3.48.1`, `3.48.0`, `3.47.0`, `3.46.0`, `3.45.2`
- `3.45.1`, `3.45.0`, `3.44.4`, `3.44.3`, `3.44.2`
- `3.44.1`, `3.44.0`, `3.43.2`, `3.43.1`, `3.43.0`
- `3.42.0`, `3.41.0`, `3.40.3`, `3.40.2`, `3.40.1`
- `3.40.0`, `3.39.1`, `3.39.0`, `3.38.1`, `3.38.0`
- `3.37.14`, `3.37.13`, `3.37.12`

</details>

**Latest Version**: `3.72.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +oracle.com/oci-cli@3.72.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `certifi.io/python-certifi^2024`
- `pyyaml.org/libyaml^0.2`
- `cryptography.io^42`
- `python.org^3.11`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.oci

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/oracle.com/oci-cli/package.yml)
- [Homepage](https://docs.cloud.oracle.com/iaas/Content/API/Concepts/cliconcepts.htm)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
