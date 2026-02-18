# terraform-cdk

> Define infrastructure resources using programming constructs and provision them using HashiCorp Terraform

## Package Information

- **Domain**: `terraform.io/cdk`
- **Name**: `terraform-cdk`
- **Homepage**: <https://www.terraform.io/cdktf>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/terraform.io/cdk/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install terraform.io/cdk
```

## Programs

This package provides the following executable programs:

- `cdktf`

## Available Versions

<details>
<summary>Show all 20 versions</summary>

- `0.21.0`
- `0.20.12`, `0.20.11`, `0.20.10`, `0.20.9`, `0.20.8`, `0.20.7`, `0.20.6`, `0.20.5`, `0.20.4`, `0.20.3`, `0.20.2`, `0.20.1`, `0.20.0`
- `0.19.2`, `0.19.1`, `0.19.0`
- `0.18.2`, `0.18.1`, `0.18.0`

</details>

**Latest Version**: `0.21.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +terraform.io/cdk@0.21.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org^17 || ^18 || ^19 || ^20`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['terraform-cdk']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/terraform.io/cdk/package.yml)
- [Homepage](https://www.terraform.io/cdktf)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
