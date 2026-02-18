# libseccomp

> Interface to the Linux Kernel's syscall filtering mechanism

## Package Information

- **Domain**: `github.com/seccomp/libseccomp`
- **Name**: `libseccomp`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/seccomp/libseccomp/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/seccomp/libseccomp
```

## Programs

This package provides the following executable programs:

- `scmp_sys_resolver`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `2.6.0`
- `2.5.6`, `2.5.5`

</details>

**Latest Version**: `2.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/seccomp/libseccomp@2.6.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libseccomp

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/seccomp/libseccomp/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
