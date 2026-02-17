# xeol

> A scanner for end-of-life (EOL) software and dependencies in container images, filesystems, and SBOMs

## Package Information

- **Domain**: `github.com/xeol-io/xeol`
- **Name**: `xeol`
- **Homepage**: https://www.xeol.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/xeol-io/xeol/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/xeol-io/xeol
```

## Programs

This package provides the following executable programs:

- `xeol`

## Available Versions

<details>
<summary>Show all 21 versions</summary>

- `0.10.8`, `0.10.7`, `0.10.6`, `0.10.5`, `0.10.4`, `0.10.3`, `0.10.2`, `0.10.1`, `0.10.0`
- `0.9.15`, `0.9.14`, `0.9.13`, `0.9.12`, `0.9.11`, `0.9.10`, `0.9.9`, `0.9.8`, `0.9.7`, `0.9.6`, `0.9.5`, `0.9.4`

</details>

**Latest Version**: `0.10.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/xeol-io/xeol@0.10.8 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xeol

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/xeol-io/xeol/package.yml)
- [Homepage](https://www.xeol.io/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
