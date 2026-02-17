# pre-commit

> A framework for managing and maintaining multi-language pre-commit hooks.

## Package Information

- **Domain**: `pre-commit.com`
- **Name**: `pre-commit`
- **Homepage**: https://pre-commit.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pre-commit.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pre-commit.com
```

## Programs

This package provides the following executable programs:

- `pre-commit`

## Available Versions

<details>
<summary>Show all 26 versions</summary>

- `4.5.1`, `4.5.0`
- `4.4.0`
- `4.3.0`
- `4.2.0`
- `4.1.0`
- `4.0.1`, `4.0.0`
- `3.8.0`
- `3.7.1`, `3.7.0`
- `3.6.2`, `3.6.1`, `3.6.0`
- `3.5.0`
- `3.4.0`
- `3.3.3`, `3.3.2`, `3.3.1`, `3.3.0`
- `3.2.2`, `3.2.1`, `3.2.0`
- `3.1.1`, `3.1.0`
- `3.0.4`

</details>

**Latest Version**: `4.5.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pre-commit.com@4.5.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.8<3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['pre-commit']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pre-commit.com/package.yml)
- [Homepage](https://pre-commit.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
