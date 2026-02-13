# az

> Azure Command-Line Interface

## Package Information

- **Domain**: `microsoft.com/azure-cli`
- **Name**: `az`
- **Homepage**: https://docs.microsoft.com/cli/azure/overview
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/microsoft.com/azure-cli/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install microsoft.com/azure-cli
```

## Programs

This package provides the following executable programs:

- `az`

## Available Versions

<details>
<summary>Show all 41 versions</summary>

- `2.82.0`, `2.81.0`, `2.80.0`, `2.79.0`, `2.78.0`
- `2.77.0`, `2.76.0`, `2.75.0`, `2.74.0`, `2.73.0`
- `2.72.0`, `2.71.0`, `2.70.0`, `2.69.0`, `2.68.0`
- `2.67.0`, `2.66.2`, `2.66.1`, `2.66.0`, `2.65.0`
- `2.64.0`, `2.63.0`, `2.62.0`, `2.61.0`, `2.60.0`
- `2.59.0`, `2.58.0`, `2.57.0`, `2.56.0`, `2.55.0`
- `2.54.0`, `2.53.1`, `2.53.0`, `2.52.0`, `2.51.0`
- `2.50.0`, `2.49.0`, `2.48.1`, `2.48.0`, `2.47.0`
- `2.45.0`

</details>

**Latest Version**: `2.82.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +microsoft.com/azure-cli@2.82.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org@1.1`
- `python.org>=3.10<3.12`
- `sourceware.org/libffi`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.az

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/microsoft.com/azure-cli/package.yml)
- [Homepage](https://docs.microsoft.com/cli/azure/overview)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
