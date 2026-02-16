# lima-vm

> Linux virtual machines, with a focus on running containers

## Package Information

- **Domain**: `lima-vm.io`
- **Name**: `lima-vm`
- **Homepage**: https://lima-vm.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/lima-vm.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install lima-vm.io
```

## Programs

This package provides the following executable programs:

- `apptainer.lima`
- `docker.lima`
- `kubectl.lima`
- `lima`
- `limactl`
- `nerdctl.lima`
- `podman.lima`

## Available Versions

<details>
<summary>Show all 33 versions</summary>

- `2.0.3`, `2.0.2`, `2.0.1`, `2.0.0`, `1.2.3`
- `1.2.2`, `1.2.1`, `1.2.0`, `1.1.1`, `1.1.0`
- `1.0.7`, `1.0.6`, `1.0.5`, `1.0.4`, `1.0.3`
- `1.0.2`, `1.0.1`, `1.0.0`, `0.23.2`, `0.23.1`
- `0.23.0`, `0.22.0`, `0.21.0`, `0.20.2`, `0.20.1`
- `0.20.0`, `0.19.1`, `0.19.0`, `0.18.0`, `0.17.2`
- `0.17.1`, `0.17.0`, `0.16.0`

</details>

**Latest Version**: `2.0.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +lima-vm.io@2.0.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `qemu.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['lima-vm']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/lima-vm.io/package.yml)
- [Homepage](https://lima-vm.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
