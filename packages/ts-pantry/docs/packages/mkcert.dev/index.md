# mkcert

> A simple zero-config tool to make locally trusted development certificates with any names you'd like.

## Package Information

- **Domain**: `mkcert.dev`
- **Name**: `mkcert`
- **Homepage**: https://mkcert.dev
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mkcert.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mkcert.dev
```

## Programs

This package provides the following executable programs:

- `mkcert`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.4.4`

</details>

**Latest Version**: `1.4.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mkcert.dev@1.4.4 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mkcert

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mkcert.dev/package.yml)
- [Homepage](https://mkcert.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
