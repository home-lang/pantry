# libproxy

> Library that provides automatic proxy configuration management

## Package Information

- **Domain**: `libproxy.github.io/libproxy`
- **Name**: `libproxy`
- **Homepage**: https://libproxy.github.io/libproxy/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libproxy.github.io/libproxy/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libproxy.github.io/libproxy
```

## Programs

This package provides the following executable programs:

- `proxy`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `0.5.12`, `0.5.11`, `0.5.10`, `0.5.9`, `0.5.8`
- `0.5.7`, `0.5.6`, `0.5.5`, `0.5.4`, `0.5.3`

</details>

**Latest Version**: `0.5.12`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libproxy.github.io/libproxy@0.5.12 -- $SHELL -i
```

## Dependencies

This package depends on:

- `duktape.org`
- `gnome.org/glib`
- `curl.se`
- `linux:freedesktop.org/dbus`
- `linux:llvm.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libproxy

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libproxy.github.io/libproxy/package.yml)
- [Homepage](https://libproxy.github.io/libproxy/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
