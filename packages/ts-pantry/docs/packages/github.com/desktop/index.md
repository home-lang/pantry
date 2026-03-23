# GitHub Desktop

> A desktop application for contributing to projects on GitHub.

## Package Information

- **Domain**: `github.com/desktop`
- **Name**: `GitHub Desktop`
- **Homepage**: <https://desktop.github.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/desktop/package.yml)

## Installation

```bash
# Install with pantry
pantry install github.com/desktop
```

## Programs

This package provides the following executable programs:

- `github-desktop`

## Aliases

This package can also be accessed using these aliases:

- `github-desktop`
- `gh-desktop`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `3.4.12`, `3.4.11`

</details>

**Latest Version**: `3.4.12`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/desktop@3.4.12 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['github-desktop']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/desktop/package.yml)
- [Homepage](https://desktop.github.com)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
