# json-c

> https://github.com/json-c/json-c is the official code repository for json-c. See the wiki for release tarballs for download. API docs at http://json-c.github.io/json-c/

## Package Information

- **Domain**: `github.com/json-c/json-c`
- **Name**: `json-c`
- **Homepage**: https://github.com/json-c/json-c/wiki
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/json-c/json-c/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/json-c/json-c
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.18.0`
- `0.17.0`
- `0.16.0`

</details>

**Latest Version**: `0.18.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/json-c/json-c@0.18.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['json-c']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/json-c/json-c/package.yml)
- [Homepage](https://github.com/json-c/json-c/wiki)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
