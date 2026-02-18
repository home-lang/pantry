# gauche

> R7RS Scheme implementation, developed to be a handy script interpreter

## Package Information

- **Domain**: `practical-scheme.net/gauche`
- **Name**: `gauche`
- **Homepage**: <https://practical-scheme.net/gauche/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/practical-scheme.net/gauche/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install practical-scheme.net/gauche
```

## Programs

This package provides the following executable programs:

- `gauche-cesconv`
- `gauche-config`
- `gauche-install`
- `gauche-package`
- `gosh`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.9.15`, `0.9.14`

</details>

**Latest Version**: `0.9.15`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +practical-scheme.net/gauche@0.9.15 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se/ca-certs>=2023`
- `github.com/Mbed-TLS/mbedtls^3.5`
- `github.com/besser82/libxcrypt^4.4`
- `zlib.net^1.3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gauche

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/practical-scheme.net/gauche/package.yml)
- [Homepage](https://practical-scheme.net/gauche/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
