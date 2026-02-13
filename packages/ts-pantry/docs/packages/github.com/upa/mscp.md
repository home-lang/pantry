# mscp

> mscp: transfer files over multiple SSH (SFTP) connections

## Package Information

- **Domain**: `github.com/upa/mscp`
- **Name**: `mscp`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/upa/mscp/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/upa/mscp
```

## Programs

This package provides the following executable programs:

- `mscp`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `0.2.4`, `0.2.3`, `0.2.2`, `0.2.1`

</details>

**Latest Version**: `0.2.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/upa/mscp@0.2.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1.2.11`
- `openssl.org^1.1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mscp

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/upa/mscp/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
