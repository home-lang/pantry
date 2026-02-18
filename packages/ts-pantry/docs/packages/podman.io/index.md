# podman

> Podman: A tool for managing OCI containers and pods.

## Package Information

- **Domain**: `podman.io`
- **Name**: `podman`
- **Homepage**: https://podman.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/podman.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install podman.io
```

## Programs

This package provides the following executable programs:

- `podman`
- `podman-remote`
- `podman-mac-helper`

## Available Versions

<details>
<summary>Show all 46 versions</summary>

- `5.8.0`
- `5.7.1`, `5.7.0`
- `5.6.2`, `5.6.1`, `5.6.0`
- `5.5.2`, `5.5.1`, `5.5.0`
- `5.4.2`, `5.4.1`, `5.4.0`
- `5.3.2`, `5.3.1`, `5.3.0`
- `5.2.5`, `5.2.4`, `5.2.3`, `5.2.2`, `5.2.1`, `5.2.0`
- `5.1.2`, `5.1.1`, `5.1.0`
- `5.0.3`, `5.0.2`, `5.0.1`, `5.0.0`
- `4.9.5`, `4.9.4`, `4.9.3`, `4.9.2`, `4.9.1`, `4.9.0`
- `4.8.3`, `4.8.2`, `4.8.1`, `4.8.0`
- `4.7.2`, `4.7.1`, `4.7.0`
- `4.6.2`, `4.6.1`, `4.6.0`
- `4.5.1`, `4.5.0`

</details>

**Latest Version**: `5.8.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +podman.io@5.8.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `qemu.org`
- `github.com/containers/gvisor-tap-vsock`
- `darwin:github.com/crc-org/vfkit`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.podman

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/podman.io/package.yml)
- [Homepage](https://podman.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
