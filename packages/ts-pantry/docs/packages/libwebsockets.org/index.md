# libwebsockets

> canonical libwebsockets.org networking library

## Package Information

- **Domain**: `libwebsockets.org`
- **Name**: `libwebsockets`
- **Homepage**: <https://libwebsockets.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libwebsockets.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libwebsockets.org
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 12 versions</summary>

- `4.5.2`, `4.5.1`, `4.5.0`, `4.4.2`, `4.4.1`
- `4.4.0`, `4.3.7`, `4.3.6`, `4.3.5`, `4.3.4`
- `4.3.3`, `4.3.2`

</details>

**Latest Version**: `4.5.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libwebsockets.org@4.5.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libuv.org@1`
- `libevent.org@2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libwebsockets

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libwebsockets.org/package.yml)
- [Homepage](https://libwebsockets.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
