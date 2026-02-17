# gvisor-tap-vsock

> A new network stack based on gVisor

## Package Information

- **Domain**: `github.com/containers/gvisor-tap-vsock`
- **Name**: `gvisor-tap-vsock`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/containers/gvisor-tap-vsock/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/containers/gvisor-tap-vsock
```

## Programs

This package provides the following executable programs:

- `gvproxy`
- `qemu-wrapper`

## Available Versions

<details>
<summary>Show all 17 versions</summary>

- `0.8.8`, `0.8.7`, `0.8.6`, `0.8.5`, `0.8.4`, `0.8.3`, `0.8.2`, `0.8.1`, `0.8.0`
- `0.7.5`, `0.7.4`, `0.7.3`, `0.7.2`, `0.7.1`, `0.7.0`
- `0.6.2`, `0.6.1`

</details>

**Latest Version**: `0.8.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/containers/gvisor-tap-vsock@0.8.8 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['gvisor-tap-vsock']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/containers/gvisor-tap-vsock/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
