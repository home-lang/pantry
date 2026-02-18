# sftpgo

> Full-featured and highly configurable SFTP, HTTP/S, FTP/S and WebDAV server - S3, Google Cloud Storage, Azure Blob

## Package Information

- **Domain**: `sftpgo.com`
- **Name**: `sftpgo`
- **Homepage**: <https://sftpgo.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sftpgo.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sftpgo.com
```

## Programs

This package provides the following executable programs:

- `sftpgo`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `2.7.0`
- `2.6.6`, `2.6.5`, `2.6.4`, `2.6.3`, `2.6.2`, `2.6.1`, `2.6.0`
- `2.5.6`

</details>

**Latest Version**: `2.7.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sftpgo.com@2.7.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sftpgo

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sftpgo.com/package.yml)
- [Homepage](https://sftpgo.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
