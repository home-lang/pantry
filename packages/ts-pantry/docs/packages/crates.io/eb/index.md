# eb

> Client for Amazon Elastic Beanstalk web service

## Package Information

- **Domain**: `crates.io/eb`
- **Name**: `eb`
- **Homepage**: <https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/eb/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/eb
```

## Programs

This package provides the following executable programs:

- `eb`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.5.0`

</details>

**Latest Version**: `0.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/eb@0.5.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.eb

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/eb/package.yml)
- [Homepage](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
