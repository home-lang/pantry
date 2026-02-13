# aws-vault

> A vault for securely storing and accessing AWS credentials in development environments

## Package Information

- **Domain**: `github.com/99designs/aws-vault`
- **Name**: `aws-vault`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/99designs/aws-vault/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/99designs/aws-vault
```

## Programs

This package provides the following executable programs:

- `aws-vault`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `7.2.0`

</details>

**Latest Version**: `7.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/99designs/aws-vault@7.2.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['aws-vault']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/99designs/aws-vault/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
