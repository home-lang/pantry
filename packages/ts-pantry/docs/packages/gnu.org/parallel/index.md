# parallel

> Shell command parallelization utility

## Package Information

- **Domain**: `gnu.org/parallel`
- **Name**: `parallel`
- **Homepage**: https://savannah.gnu.org/projects/parallel/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/parallel/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/parallel
```

## Programs

This package provides the following executable programs:

- `env_parallel`
- `niceload`
- `parallel`
- `parcat`
- `parset`
- `parsort`
- `sem`
- `sql`

## Available Versions

<details>
<summary>Show all 24 versions</summary>

- `20251222.0.0`, `20251122.0.0`, `20251022.0.0`, `20250922.0.0`, `20250822.0.0`
- `20250722.0.0`, `20250622.0.0`, `20250522.0.0`, `20250422.0.0`, `20250322.0.0`
- `20250222.0.0`, `20250122.0.0`, `20241222.0.0`, `20241122.0.0`, `20241022.0.0`
- `20240922.0.0`, `20240822.0.0`, `20240722.0.0`, `20240622.0.0`, `20240522.0.0`
- `20240422.0.0`, `20240322.0.0`, `20240222.0.0`, `20240122.0.0`

</details>

**Latest Version**: `20251222.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/parallel@20251222.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `perl.org@5`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.parallel

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/parallel/package.yml)
- [Homepage](https://savannah.gnu.org/projects/parallel/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
