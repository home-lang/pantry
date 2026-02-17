# trivy

> Find vulnerabilities, misconfigurations, secrets, SBOM in containers, Kubernetes, code repositories, clouds and more

## Package Information

- **Domain**: `aquasecurity.github.io/trivy`
- **Name**: `trivy`
- **Homepage**: https://aquasecurity.github.io/trivy/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/aquasecurity.github.io/trivy/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install aquasecurity.github.io/trivy
```

## Programs

This package provides the following executable programs:

- `trivy`

## Available Versions

<details>
<summary>Show all 45 versions</summary>

- `0.69.1`, `0.69.0`
- `0.68.2`, `0.68.1`
- `0.67.2`
- `0.66.0`
- `0.65.0`
- `0.64.1`, `0.64.0`
- `0.63.0`
- `0.62.1`, `0.62.0`
- `0.61.1`, `0.61.0`
- `0.60.0`
- `0.59.1`, `0.59.0`
- `0.58.2`, `0.58.1`, `0.58.0`
- `0.57.1`, `0.57.0`
- `0.56.2`, `0.56.1`, `0.56.0`
- `0.55.2`, `0.55.1`, `0.55.0`
- `0.54.1`, `0.54.0`
- `0.53.0`
- `0.52.2`, `0.52.1`, `0.52.0`
- `0.51.4`, `0.51.2`, `0.51.1`, `0.51.0`
- `0.50.4`, `0.50.2`, `0.50.1`, `0.50.0`
- `0.49.1`, `0.49.0`
- `0.48.3`

</details>

**Latest Version**: `0.69.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +aquasecurity.github.io/trivy@0.69.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.trivy

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/aquasecurity.github.io/trivy/package.yml)
- [Homepage](https://aquasecurity.github.io/trivy/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
