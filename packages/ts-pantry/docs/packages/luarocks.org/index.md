# luarocks

> LuaRocks is the package manager for the Lua programming language.

## Package Information

- **Domain**: `luarocks.org`
- **Name**: `luarocks`
- **Homepage**: https://luarocks.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/luarocks.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install luarocks.org
```

## Programs

This package provides the following executable programs:

- `luarocks`
- `luarocks-admin`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `3.13.0`, `3.12.2`, `3.12.1`, `3.12.0`, `3.11.1`
- `3.11.0`, `3.10.0`, `3.9.2`

</details>

**Latest Version**: `3.13.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +luarocks.org@3.13.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `lua.org`
- `info-zip.org/unzip`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.luarocks

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/luarocks.org/package.yml)
- [Homepage](https://luarocks.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
