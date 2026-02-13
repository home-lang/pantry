# rclone

> "rsync for cloud storage" - Google Drive, S3, Dropbox, Backblaze B2, One Drive, Swift, Hubic, Wasabi, Google Cloud Storage, Azure Blob, Azure Files, Yandex Files

## Package Information

- **Domain**: `rclone.org`
- **Name**: `rclone`
- **Homepage**: https://rclone.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rclone.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rclone.org
```

## Programs

This package provides the following executable programs:

- `rclone`

## Available Versions

<details>
<summary>Show all 25 versions</summary>

- `1.72.1`, `1.72.0`, `1.71.2`, `1.71.1`, `1.71.0`
- `1.70.3`, `1.70.2`, `1.70.1`, `1.70.0`, `1.69.3`
- `1.69.2`, `1.69.1`, `1.69.0`, `1.68.2`, `1.68.1`
- `1.68.0`, `1.67.0`, `1.66.0`, `1.65.2`, `1.65.1`
- `1.65.0`, `1.64.2`, `1.64.1`, `1.64.0`, `1.63.1`

</details>

**Latest Version**: `1.72.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rclone.org@1.72.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rclone

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rclone.org/package.yml)
- [Homepage](https://rclone.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
