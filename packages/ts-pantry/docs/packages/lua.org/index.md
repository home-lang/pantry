# lua

> Powerful, lightweight programming language

## Package Information

- **Domain**: `lua.org`
- **Name**: `lua`
- **Homepage**: https://www.lua.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/lua.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install lua.org
```

## Programs

This package provides the following executable programs:

- `lua`
- `luac`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `5.5.0`, `5.4.8`, `5.4.7`, `5.4.6`, `5.4.4`

</details>

**Latest Version**: `5.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +lua.org@5.5.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/readline`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.lua

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/lua.org/package.yml)
- [Homepage](https://www.lua.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
