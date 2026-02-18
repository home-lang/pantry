# pytest

> The pytest framework makes it easy to write small tests, yet scales to support complex functional testing

## Package Information

- **Domain**: `pytest.org`
- **Name**: `pytest`
- **Homepage**: https://docs.pytest.org/en/latest/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pytest.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pytest.org
```

## Programs

This package provides the following executable programs:

- `pytest`

## Available Versions

<details>
<summary>Show all 31 versions</summary>

- `9.0.2`, `9.0.1`, `9.0.0`
- `8.4.2`, `8.4.1`, `8.4.0`
- `8.3.5`, `8.3.4`, `8.3.3`, `8.3.2`, `8.3.1`, `8.3.0`
- `8.2.2`, `8.2.1`, `8.2.0`
- `8.1.2`, `8.1.1`, `8.1.0`
- `8.0.2`, `8.0.1`, `8.0.0`
- `7.4.4`, `7.4.3`, `7.4.2`, `7.4.1`, `7.4.0`
- `7.3.2`, `7.3.1`, `7.3.0`
- `7.2.2`
- `7.1.0`

</details>

**Latest Version**: `9.0.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pytest.org@9.0.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pytest

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pytest.org/package.yml)
- [Homepage](https://docs.pytest.org/en/latest/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
