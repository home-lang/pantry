# stern

> ⎈ Multi pod and container log tailing for Kubernetes -- Friendly fork of https://github.com/wercker/stern

## Package Information

- **Domain**: `github.com/stern/stern`
- **Name**: `stern`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/stern/stern/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/stern/stern
```

## Programs

This package provides the following executable programs:

- `stern`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `1.33.1`, `1.33.0`, `1.32.0`, `1.31.0`, `1.30.0`
- `1.29.0`, `1.28.0`, `1.27.0`, `1.26.0`

</details>

**Latest Version**: `1.33.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/stern/stern@1.33.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.stern

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/stern/stern/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
