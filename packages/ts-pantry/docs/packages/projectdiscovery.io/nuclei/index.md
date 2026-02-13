# nuclei

> Nuclei is a fast, customizable vulnerability scanner powered by the global security community and built on a simple YAML-based DSL, enabling collaboration to tackle trending vulnerabilities on the internet. It helps you find vulnerabilities in your applications, APIs, networks, DNS, and cloud configurations.

## Package Information

- **Domain**: `projectdiscovery.io/nuclei`
- **Name**: `nuclei`
- **Homepage**: https://nuclei.projectdiscovery.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/projectdiscovery.io/nuclei/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install projectdiscovery.io/nuclei
```

## Programs

This package provides the following executable programs:

- `nuclei`

## Available Versions

<details>
<summary>Show all 14 versions</summary>

- `3.6.2`, `3.6.1`, `3.6.0`, `3.5.1`, `3.5.0`
- `3.4.10`, `3.4.9`, `3.4.8`, `3.4.7`, `3.4.6`
- `3.4.5`, `3.4.4`, `3.4.3`, `3.4.2`

</details>

**Latest Version**: `3.6.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +projectdiscovery.io/nuclei@3.6.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.nuclei

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/projectdiscovery.io/nuclei/package.yml)
- [Homepage](https://nuclei.projectdiscovery.io/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
