# tsc

> TypeScript is a superset of JavaScript that compiles to clean JavaScript output.

## Package Information

- **Domain**: `typescriptlang.org`
- **Name**: `tsc`
- **Homepage**: <https://www.typescriptlang.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/typescriptlang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install typescriptlang.org
```

## Programs

This package provides the following executable programs:

- `tsc`

## Available Versions

<details>
<summary>Show all 15 versions</summary>

- `5.9.3`, `5.9.2`
- `5.8.3`, `5.8.2`
- `5.7.3`, `5.7.2`
- `5.6.3`, `5.6.2`
- `5.5.4`, `5.5.3`, `5.5.2`
- `5.4.5`, `5.4.4`, `5.4.3`, `5.4.2`

</details>

**Latest Version**: `5.9.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +typescriptlang.org@5.9.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org^20`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tsc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/typescriptlang.org/package.yml)
- [Homepage](https://www.typescriptlang.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
