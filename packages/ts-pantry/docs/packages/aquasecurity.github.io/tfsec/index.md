# tfsec

> Static analysis security scanner for your terraform code

## Package Information

- **Domain**: `aquasecurity.github.io/tfsec`
- **Name**: `tfsec`
- **Homepage**: <https://aquasecurity.github.io/tfsec/latest/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/aquasecurity.github.io/tfsec/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install aquasecurity.github.io/tfsec
```

## Programs

This package provides the following executable programs:

- `tfsec`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `1.28.14`, `1.28.13`, `1.28.12`, `1.28.11`, `1.28.10`, `1.28.9`, `1.28.7`, `1.28.6`, `1.28.5`

</details>

**Latest Version**: `1.28.14`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +aquasecurity.github.io/tfsec@1.28.14 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tfsec

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/aquasecurity.github.io/tfsec/package.yml)
- [Homepage](https://aquasecurity.github.io/tfsec/latest/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
