# awslocal

> 💲 "awslocal" - Thin wrapper around the "aws" command line interface for use with LocalStack

## Package Information

- **Domain**: `localstack.cloud/awscli-local`
- **Name**: `awslocal`
- **Homepage**: https://www.localstack.cloud/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/localstack.cloud/awscli-local/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install localstack.cloud/awscli-local
```

## Programs

This package provides the following executable programs:

- `awslocal`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2023.12.28`

</details>

**Latest Version**: `2023.12.28`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +localstack.cloud/awscli-local@2023.12.28 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`
- `aws.amazon.com/cli^2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.awslocal

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/localstack.cloud/awscli-local/package.yml)
- [Homepage](https://www.localstack.cloud/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
