# mypy-lang

> Experimental optional static type checker for Python

## Package Information

- **Domain**: `mypy-lang.org`
- **Name**: `mypy-lang`
- **Homepage**: <https://www.mypy-lang.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mypy-lang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mypy-lang.org
```

## Programs

This package provides the following executable programs:

- `mypy`
- `mypyc`
- `dmypy`

## Available Versions

<details>
<summary>Show all 31 versions</summary>

- `1.19.1`, `1.19.0`
- `1.18.2`, `1.18.1`
- `1.17.1`, `1.17.0`
- `1.16.1`, `1.16.0`
- `1.15.0`
- `1.14.1`, `1.14.0`
- `1.13.0`
- `1.12.1`, `1.12.0`
- `1.11.2`, `1.11.1`, `1.11.0`
- `1.10.1`, `1.10.0`
- `1.9.0`
- `1.8.0`
- `1.7.1`, `1.7.0`
- `1.6.1`, `1.6.0`
- `1.5.1`, `1.5.0`
- `1.4.1`, `1.4.0`
- `1.3.0`
- `1.2.0`

</details>

**Latest Version**: `1.19.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mypy-lang.org@1.19.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['mypy-lang']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mypy-lang.org/package.yml)
- [Homepage](https://www.mypy-lang.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
