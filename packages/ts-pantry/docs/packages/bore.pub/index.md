# bore

> Modern, simple TCP tunnel in Rust that exposes local ports to a remote server

## Package Information

- **Domain**: `bore.pub`
- **Name**: `bore`
- **Homepage**: <http://bore.pub>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/bore.pub/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install bore.pub
```

## Programs

This package provides the following executable programs:

- `bore`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `0.6.0`
- `0.5.3`, `0.5.2`, `0.5.1`, `0.5.0`

</details>

**Latest Version**: `0.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +bore.pub@0.6.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bore

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/bore.pub/package.yml)
- [Homepage](http://bore.pub)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
