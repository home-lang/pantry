# terratag

> Terratag is a CLI tool that enables users of Terraform to automatically create and maintain tags across their entire set of AWS, Azure, and GCP resources

## Package Information

- **Domain**: `terratag.io`
- **Name**: `terratag`
- **Homepage**: https://terratag.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/terratag.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install terratag.io
```

## Programs

This package provides the following executable programs:

- `terratag`

## Available Versions

<details>
<summary>Show all 22 versions</summary>

- `0.7.6`, `0.7.5`, `0.7.4`, `0.7.3`, `0.7.2`, `0.7.1`, `0.7.0`
- `0.6.1`, `0.6.0`
- `0.5.3`, `0.5.2`, `0.5.1`, `0.5.0`
- `0.4.1`, `0.4.0`
- `0.3.5`, `0.3.4`, `0.3.3`, `0.3.2`, `0.3.1`, `0.3.0`
- `0.2.6`

</details>

**Latest Version**: `0.7.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +terratag.io@0.7.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `terraform.io>=0.12`
- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.terratag

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/terratag.io/package.yml)
- [Homepage](https://terratag.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
