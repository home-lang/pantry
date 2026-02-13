# SeaweedFS

> SeaweedFS is a fast distributed storage system for blobs, objects, files, and data lake, for billions of files! Blob store has O(1) disk seek, cloud tiering. Filer supports Cloud Drive, cross-DC active-active replication, Kubernetes, POSIX FUSE mount, S3 API, S3 Gateway, Hadoop, WebDAV, encryption, Erasure Coding.

## Package Information

- **Domain**: `seaweedfs.com`
- **Name**: `SeaweedFS`
- **Homepage**: https://seaweedfs.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/seaweedfs.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install seaweedfs.com
```

## Programs

This package provides the following executable programs:

- `weed`

## Available Versions

<details>
<summary>Show all 29 versions</summary>

- `4.7.0`, `4.6.0`, `4.5.0`, `4.4.0`, `4.3.0`
- `4.2.0`, `4.1.0`, `4.0.0`, `3.99.0`, `3.98.0`
- `3.97.0`, `3.96.0`, `3.95.0`, `3.94.0`, `3.93.0`
- `3.92.0`, `3.91.0`, `3.90.0`, `3.89.0`, `3.88.0`
- `3.87.0`, `3.86.0`, `3.85.0`, `3.84.0`, `3.83.0`
- `3.82.0`, `3.81.0`, `3.80.0`, `3.79.0`

</details>

**Latest Version**: `4.7.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +seaweedfs.com@4.7.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.SeaweedFS

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/seaweedfs.com/package.yml)
- [Homepage](https://seaweedfs.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
