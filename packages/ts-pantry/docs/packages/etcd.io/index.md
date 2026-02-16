# etcd

> Distributed reliable key-value store for the most critical data of a distributed system

## Package Information

- **Domain**: `etcd.io`
- **Name**: `etcd`
- **Homepage**: <https://etcd.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/etcd.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install etcd.io
```

## Programs

This package provides the following executable programs:

- `etcd`
- `etcdctl`

## Available Versions

<details>
<summary>Show all 29 versions</summary>

- `3.6.8`, `3.6.7`, `3.6.6`, `3.6.5`, `3.6.4`
- `3.6.3`, `3.6.2`, `3.6.1`, `3.6.0`, `3.5.27`
- `3.5.26`, `3.5.25`, `3.5.24`, `3.5.23`, `3.5.22`
- `3.5.21`, `3.5.20`, `3.5.19`, `3.5.18`, `3.5.17`
- `3.5.16`, `3.5.15`, `3.5.14`, `3.4.41`, `3.4.40`
- `3.4.39`, `3.4.38`, `3.4.37`, `3.4.36`

</details>

**Latest Version**: `3.6.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +etcd.io@3.6.8 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.etcd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/etcd.io/package.yml)
- [Homepage](https://etcd.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
