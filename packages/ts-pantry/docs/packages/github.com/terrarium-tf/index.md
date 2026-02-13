# terrarium

> terraform wrapper which transparent loads env files for stacks

## Package Information

- **Domain**: `github.com/terrarium-tf`
- **Name**: `terrarium`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/terrarium-tf/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/terrarium-tf
```

## Programs

This package provides the following executable programs:

- `terrarium`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.3.2`

</details>

**Latest Version**: `1.3.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/terrarium-tf@1.3.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `terraform.io`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.terrarium

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/terrarium-tf/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
