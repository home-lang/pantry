# jsonnet

> Jsonnet - The data templating language

## Package Information

- **Domain**: `jsonnet.org`
- **Name**: `jsonnet`
- **Homepage**: http://jsonnet.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/jsonnet.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install jsonnet.org
```

## Programs

This package provides the following executable programs:

- `jsonnet`
- `jsonnetfmt`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.21.0`
- `0.20.0`

</details>

**Latest Version**: `0.21.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +jsonnet.org@0.21.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.jsonnet

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/jsonnet.org/package.yml)
- [Homepage](http://jsonnet.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
