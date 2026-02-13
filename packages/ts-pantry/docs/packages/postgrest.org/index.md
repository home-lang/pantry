# postgrest

> Serves a fully RESTful API from any existing PostgreSQL database

## Package Information

- **Domain**: `postgrest.org`
- **Name**: `postgrest`
- **Homepage**: https://postgrest.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/postgrest.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install postgrest.org
```

## Programs

This package provides the following executable programs:

- `postgrest`

## Available Versions

<details>
<summary>Show all 23 versions</summary>

- `14.3.0`, `14.2.0`, `14.1.0`, `14.0.0`, `13.0.8`
- `13.0.7`, `13.0.6`, `13.0.5`, `13.0.4`, `13.0.3`
- `13.0.2`, `13.0.1`, `13.0.0`, `12.2.12`, `12.2.11`
- `12.2.10`, `12.2.9`, `12.2.8`, `12.2.7`, `12.2.6`
- `12.2.5`, `12.2.4`, `12.2.3`

</details>

**Latest Version**: `14.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +postgrest.org@14.3.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `postgresql.org/libpq@17`
- `zlib.net~1.3`
- `gnu.org/gcc/libstdcxx@14`
- `gnome.org/libxml2~2.13 # 2.14 changes library api version`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.postgrest

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/postgrest.org/package.yml)
- [Homepage](https://postgrest.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
