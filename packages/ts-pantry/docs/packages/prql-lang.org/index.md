# prql

> PRQL is a modern language for transforming data — a simple, powerful, pipelined SQL replacement

## Package Information

- **Domain**: `prql-lang.org`
- **Name**: `prql`
- **Homepage**: https://prql-lang.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/prql-lang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install prql-lang.org
```

## Programs

This package provides the following executable programs:

- `prql-compiler`
- `prqlc`

## Available Versions

<details>
<summary>Show all 39 versions</summary>

- `0.13.10`, `0.13.9`, `0.13.8`, `0.13.7`, `0.13.6`
- `0.13.5`, `0.13.4`, `0.13.3`, `0.13.2`, `0.13.1`
- `0.13.0`, `0.12.2`, `0.12.1`, `0.12.0`, `0.11.4`
- `0.11.3`, `0.11.2`, `0.11.1`, `0.11.0`, `0.10.1`
- `0.10.0`, `0.9.5`, `0.9.3`, `0.9.2`, `0.9.1`
- `0.9.0`, `0.8.1`, `0.8.0`, `0.7.1`, `0.7.0`
- `0.6.1`, `0.6.0`, `0.5.2`, `0.5.1`, `0.5.0`
- `0.4.2`, `0.4.1`, `0.4.0`, `0.3.1`

</details>

**Latest Version**: `0.13.10`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +prql-lang.org@0.13.10 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.prql

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/prql-lang.org/package.yml)
- [Homepage](https://prql-lang.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
