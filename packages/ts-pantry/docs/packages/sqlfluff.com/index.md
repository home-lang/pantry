# sqlfluff

> A modular SQL linter and auto-formatter with support for multiple dialects and templated code.

## Package Information

- **Domain**: `sqlfluff.com`
- **Name**: `sqlfluff`
- **Homepage**: https://docs.sqlfluff.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sqlfluff.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sqlfluff.com
```

## Programs

This package provides the following executable programs:

- `sqlfluff`

## Available Versions

<details>
<summary>Show all 27 versions</summary>

- `4.0.0`, `3.5.0`, `3.4.2`, `3.4.1`, `3.4.0`
- `3.3.1`, `3.3.0`, `3.2.5`, `3.2.4`, `3.2.3`
- `3.2.2`, `3.2.1`, `3.2.0`, `3.1.1`, `3.1.0`
- `3.0.7`, `3.0.6`, `3.0.5`, `3.0.4`, `3.0.3`
- `3.0.2`, `3.0.1`, `3.0.0`, `2.3.5`, `2.3.4`
- `2.3.3`, `2.3.2`

</details>

**Latest Version**: `4.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sqlfluff.com@4.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.7<3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sqlfluff

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sqlfluff.com/package.yml)
- [Homepage](https://docs.sqlfluff.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
