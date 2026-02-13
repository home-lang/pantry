# surreal

> A scalable, distributed, collaborative, document-graph database, for the realtime web

## Package Information

- **Domain**: `surrealdb.com`
- **Name**: `surreal`
- **Homepage**: https://surrealdb.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/surrealdb.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install surrealdb.com
```

## Programs

This package provides the following executable programs:

- `surreal`

## Available Versions

<details>
<summary>Show all 60 versions</summary>

- `2023.9.1`, `2.5.0`, `2.4.1`, `2.4.0`, `2.3.10`
- `2.3.9`, `2.3.8`, `2.3.7`, `2.3.6`, `2.3.5`
- `2.3.4`, `2.3.3`, `2.3.2`, `2.3.1`, `2.3.0`
- `2.2.8`, `2.2.7`, `2.2.6`, `2.2.5`, `2.2.4`
- `2.2.3`, `2.2.2`, `2.2.1`, `2.2.0`, `2.1.9`
- `2.1.8`, `2.1.7`, `2.1.6`, `2.1.5`, `2.1.4`
- `2.1.3`, `2.1.2`, `2.1.1`, `2.1.0`, `2.0.5`
- `2.0.4`, `2.0.3`, `2.0.2`, `2.0.1`, `2.0.0`
- `1.5.6`, `1.5.5`, `1.5.4`, `1.5.3`, `1.5.2`
- `1.5.1`, `1.5.0`, `1.4.2`, `1.4.0`, `1.3.1`
- `1.3.0`, `1.2.2`, `1.2.1`, `1.2.0`, `1.1.1`
- `1.1.0`, `1.0.2`, `1.0.1`, `1.0.0`, `0.0.0`

</details>

**Latest Version**: `2023.9.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +surrealdb.com@2023.9.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.surreal

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/surrealdb.com/package.yml)
- [Homepage](https://surrealdb.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
