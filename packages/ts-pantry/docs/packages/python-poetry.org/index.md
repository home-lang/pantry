# poetry

> Python packaging and dependency management made easy

## Package Information

- **Domain**: `python-poetry.org`
- **Name**: `poetry`
- **Homepage**: https://python-poetry.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/python-poetry.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install python-poetry.org
```

## Programs

This package provides the following executable programs:

- `poetry`

## Available Versions

<details>
<summary>Show all 26 versions</summary>

- `2.3.1`, `2.3.0`, `2.2.1`, `2.2.0`, `2.1.4`
- `2.1.3`, `2.1.2`, `2.1.1`, `2.1.0`, `2.0.1`
- `2.0.0`, `1.8.5`, `1.8.4`, `1.8.3`, `1.8.2`
- `1.8.1`, `1.8.0`, `1.7.1`, `1.7.0`, `1.6.1`
- `1.6.0`, `1.5.1`, `1.5.0`, `1.4.2`, `1.4.0`
- `1.3.2`

</details>

**Latest Version**: `2.3.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +python-poetry.org@2.3.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.poetry

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/python-poetry.org/package.yml)
- [Homepage](https://python-poetry.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
