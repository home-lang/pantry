# luv

> Bare libuv bindings for lua

## Package Information

- **Domain**: `github.com/luvit/luv`
- **Name**: `luv`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/luvit/luv/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/luvit/luv
```

## Programs

This package provides the following executable programs:

No programs specified.

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.45.0`

</details>

**Latest Version**: `1.45.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/luvit/luv@1.45.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libuv.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.luv

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/luvit/luv/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
