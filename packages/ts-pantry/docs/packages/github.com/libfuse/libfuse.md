# fusermount3

> The reference implementation of the Linux FUSE (Filesystem in Userspace) interface

## Package Information

- **Domain**: `github.com/libfuse/libfuse`
- **Name**: `fusermount3`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libfuse/libfuse/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/libfuse/libfuse
```

## Programs

This package provides the following executable programs:

- `fusermount3`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `3.18.1`, `3.18.0`, `3.17.4`, `3.17.3`, `3.17.2`
- `3.17.1`, `2.9.9`

</details>

**Latest Version**: `3.18.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/libfuse/libfuse@3.18.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.fusermount3

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libfuse/libfuse/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
