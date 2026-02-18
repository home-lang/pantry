# ttyd

> Command-line tool for sharing terminal over the web

## Package Information

- **Domain**: `tsl0922.github.io/ttyd`
- **Name**: `ttyd`
- **Homepage**: <https://tsl0922.github.io/ttyd/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tsl0922.github.io/ttyd/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tsl0922.github.io/ttyd
```

## Programs

This package provides the following executable programs:

- `ttyd`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `1.7.7`, `1.7.6`, `1.7.5`, `1.7.4`, `1.7.2`

</details>

**Latest Version**: `1.7.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tsl0922.github.io/ttyd@1.7.7 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libuv.org@1`
- `github.com/json-c/json-c^0.16`
- `libwebsockets.org~4.3 # ABI version changes in 4.4`
- `zlib.net@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ttyd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tsl0922.github.io/ttyd/package.yml)
- [Homepage](https://tsl0922.github.io/ttyd/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
