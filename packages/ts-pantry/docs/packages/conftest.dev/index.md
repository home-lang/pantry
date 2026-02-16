# conftest

> Write tests against structured configuration data using the Open Policy Agent Rego query language

## Package Information

- **Domain**: `conftest.dev`
- **Name**: `conftest`
- **Homepage**: https://www.conftest.dev/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/conftest.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install conftest.dev
```

## Programs

This package provides the following executable programs:

- `conftest`

## Available Versions

<details>
<summary>Show all 24 versions</summary>

- `0.66.0`, `0.65.0`, `0.64.0`, `0.63.0`, `0.62.0`
- `0.61.2`, `0.61.1`, `0.61.0`, `0.60.0`, `0.59.0`
- `0.58.0`, `0.57.0`, `0.56.0`, `0.55.0`, `0.54.0`
- `0.53.0`, `0.52.0`, `0.51.0`, `0.50.0`, `0.49.1`
- `0.49.0`, `0.48.0`, `0.47.0`, `0.46.0`

</details>

**Latest Version**: `0.66.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +conftest.dev@0.66.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.conftest

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/conftest.dev/package.yml)
- [Homepage](https://www.conftest.dev/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
