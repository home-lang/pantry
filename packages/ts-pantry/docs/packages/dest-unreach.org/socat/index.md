# socat

> SOcket CAT: netcat on steroids

## Package Information

- **Domain**: `dest-unreach.org/socat`
- **Name**: `socat`
- **Homepage**: <http://www.dest-unreach.org/socat/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/dest-unreach.org/socat/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install dest-unreach.org/socat
```

## Programs

This package provides the following executable programs:

- `socat`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `1.8.1.1`, `1.8.1.0`, `1.8.0.3`, `1.8.0.2`, `1.8.0.1`, `1.8.0.0`

</details>

**Latest Version**: `1.8.1.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +dest-unreach.org/socat@1.8.1.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `gnu.org/readline^8.2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.socat

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/dest-unreach.org/socat/package.yml)
- [Homepage](http://www.dest-unreach.org/socat/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
