# stress-ng

> This is the stress-ng upstream project git repository. stress-ng will stress test a computer system in various selectable ways. It was designed to exercise various physical subsystems of a computer as well as the various operating system kernel interfaces.

## Package Information

- **Domain**: `github.com/ColinIanKing/stress-ng`
- **Name**: `stress-ng`
- **Homepage**: https://wiki.ubuntu.com/Kernel/Reference/stress-ng
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ColinIanKing/stress-ng/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/ColinIanKing/stress-ng
```

## Programs

This package provides the following executable programs:

- `stress-ng`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `0.20.0`, `0.19.6`, `0.19.5`, `0.19.4`, `0.19.3`
- `0.19.2`, `0.19.1`

</details>

**Latest Version**: `0.20.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/ColinIanKing/stress-ng@0.20.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/besser82/libxcrypt`
- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['stress-ng']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ColinIanKing/stress-ng/package.yml)
- [Homepage](https://wiki.ubuntu.com/Kernel/Reference/stress-ng)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
