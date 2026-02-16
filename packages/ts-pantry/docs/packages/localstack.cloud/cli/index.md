# localstack

> The LocalStack CLI packaged using pyinstaller

## Package Information

- **Domain**: `localstack.cloud/cli`
- **Name**: `localstack`
- **Homepage**: <https://localstack.cloud/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/localstack.cloud/cli/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install localstack.cloud/cli
```

## Programs

This package provides the following executable programs:

- `localstack`

## Available Versions

<details>
<summary>Show all 35 versions</summary>

- `4.13.1`, `4.13.0`, `4.12.0`, `4.11.1`, `4.11.0`
- `4.10.0`, `4.9.2`, `4.9.1`, `4.9.0`, `4.8.1`
- `4.8.0`, `4.7.0`, `4.6.0`, `4.5.0`, `4.4.0`
- `4.3.0`, `4.2.0`, `4.1.1`, `4.1.0`, `4.0.3`
- `4.0.2`, `4.0.1`, `4.0.0`, `3.8.1`, `3.8.0`
- `3.6.0`, `3.5.0`, `3.4.0`, `3.3.0`, `3.2.0`
- `3.1.0`, `3.0.2`, `3.0.1`, `3.0.0`, `2.3.2`

</details>

**Latest Version**: `4.13.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +localstack.cloud/cli@4.13.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.localstack

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/localstack.cloud/cli/package.yml)
- [Homepage](https://localstack.cloud/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
