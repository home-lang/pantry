# mongosh

> MongoDB Shell to connect, configure, query, and work with your MongoDB database

## Package Information

- **Domain**: `mongodb.com/shell`
- **Name**: `mongosh`
- **Homepage**: https://www.mongodb.com/try/download/shell
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mongodb.com/shell/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mongodb.com/shell
```

## Programs

This package provides the following executable programs:

- `mongosh`

## Available Versions

<details>
<summary>Show all 42 versions</summary>

- `2.6.0`, `2.5.10`, `2.5.9`, `2.5.8`, `2.5.7`
- `2.5.6`, `2.5.5`, `2.5.3`, `2.5.2`, `2.5.1`
- `2.5.0`, `2.4.2`, `2.4.0`, `2.3.9`, `2.3.8`
- `2.3.7`, `2.3.6`, `2.3.5`, `2.3.4`, `2.3.3`
- `2.3.2`, `2.3.1`, `2.3.0`, `2.2.15`, `2.2.12`
- `2.2.11`, `2.2.10`, `2.2.9`, `2.2.6`, `2.2.5`
- `2.2.4`, `2.2.3`, `2.2.2`, `2.2.1`, `2.2.0`
- `2.1.5`, `2.1.4`, `2.1.3`, `2.1.1`, `2.1.0`
- `2.0.2`, `2.0.1`

</details>

**Latest Version**: `2.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mongodb.com/shell@2.6.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mongosh

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mongodb.com/shell/package.yml)
- [Homepage](https://www.mongodb.com/try/download/shell)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
