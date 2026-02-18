# cookiecutter

> A cross-platform command-line utility that creates projects from cookiecutters (project templates), e.g. Python package projects, C projects.

## Package Information

- **Domain**: `github.com/cookiecutter/cookiecutter`
- **Name**: `cookiecutter`
- **Homepage**: <https://pypi.org/project/cookiecutter/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/cookiecutter/cookiecutter/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/cookiecutter/cookiecutter
```

## Programs

This package provides the following executable programs:

- `cookiecutter`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.6.0`

</details>

**Latest Version**: `2.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/cookiecutter/cookiecutter@2.6.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cookiecutter

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/cookiecutter/cookiecutter/package.yml)
- [Homepage](https://pypi.org/project/cookiecutter/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
