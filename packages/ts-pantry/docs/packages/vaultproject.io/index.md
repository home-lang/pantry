# vault

> A tool for secrets management, encryption as a service, and privileged access management

## Package Information

- **Domain**: `vaultproject.io`
- **Name**: `vault`
- **Homepage**: https://www.vaultproject.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/vaultproject.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install vaultproject.io
```

## Programs

This package provides the following executable programs:

- `vault`

## Available Versions

<details>
<summary>Show all 62 versions</summary>

- `1.21.2`, `1.21.1`, `1.20.3`, `1.20.2`, `1.20.1`
- `1.20.0`, `1.19.5`, `1.19.4`, `1.19.3`, `1.19.2`
- `1.19.1`, `1.19.0`, `1.18.5`, `1.18.4`, `1.18.3`
- `1.18.2`, `1.18.1`, `1.18.0`, `1.17.6`, `1.17.5`
- `1.17.4`, `1.17.3`, `1.17.2`, `1.17.1`, `1.17.0`
- `1.16.3`, `1.16.2`, `1.16.1`, `1.16.0`, `1.15.6`
- `1.15.5`, `1.15.4`, `1.15.3`, `1.15.2`, `1.15.1`
- `1.15.0`, `1.14.10`, `1.14.9`, `1.14.8`, `1.14.7`
- `1.14.6`, `1.14.5`, `1.14.4`, `1.14.3`, `1.14.2`
- `1.14.1`, `1.14.0`, `1.13.13`, `1.13.12`, `1.13.11`
- `1.13.10`, `1.13.9`, `1.13.8`, `1.13.7`, `1.13.6`
- `1.13.5`, `1.13.4`, `1.13.3`, `1.12.11`, `1.12.10`
- `1.12.9`, `1.12.8`

</details>

**Latest Version**: `1.21.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +vaultproject.io@1.21.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.vault

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/vaultproject.io/package.yml)
- [Homepage](https://www.vaultproject.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
