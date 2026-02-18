# s3cmd

> Official s3cmd repo -- Command line tool for managing S3 compatible storage services (including Amazon S3 and CloudFront).

## Package Information

- **Domain**: `s3tools.org/s3cmd`
- **Name**: `s3cmd`
- **Homepage**: <https://s3tools.org/s3cmd>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/s3tools.org/s3cmd/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install s3tools.org/s3cmd
```

## Programs

This package provides the following executable programs:

- `s3cmd`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.4.0`

</details>

**Latest Version**: `2.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +s3tools.org/s3cmd@2.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.s3cmd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/s3tools.org/s3cmd/package.yml)
- [Homepage](https://s3tools.org/s3cmd)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
