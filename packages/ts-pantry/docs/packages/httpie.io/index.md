# httpie

> 🥧 HTTPie CLI — modern, user-friendly command-line HTTP client for the API era. JSON support, colors, sessions, downloads, plugins & more.

## Package Information

- **Domain**: `httpie.io`
- **Name**: `httpie`
- **Homepage**: https://httpie.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/httpie.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install httpie.io
```

## Programs

This package provides the following executable programs:

- `http`
- `httpie`
- `https`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `3.2.4`, `3.2.3`, `3.2.2`, `3.2.1`

</details>

**Latest Version**: `3.2.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +httpie.io@3.2.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3<3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.httpie

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/httpie.io/package.yml)
- [Homepage](https://httpie.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
