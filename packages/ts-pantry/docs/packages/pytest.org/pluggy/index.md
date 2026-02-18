# pluggy

> A minimalist production ready plugin system

## Package Information

- **Domain**: `pytest.org/pluggy`
- **Name**: `pluggy`
- **Homepage**: <https://pluggy.readthedocs.io/en/latest/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pytest.org/pluggy/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pytest.org/pluggy
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.6.0`
- `1.5.0`
- `1.4.0`

</details>

**Latest Version**: `1.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pytest.org/pluggy@1.6.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org^3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pluggy

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pytest.org/pluggy/package.yml)
- [Homepage](https://pluggy.readthedocs.io/en/latest/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
