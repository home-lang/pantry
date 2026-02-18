# starpls

> An LSP implementation for Starlark, the configuration language used by Bazel and Buck2.

## Package Information

- **Domain**: `github.com/withered-magic/starpls`
- **Name**: `starpls`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/withered-magic/starpls/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/withered-magic/starpls
```

## Programs

This package provides the following executable programs:

- `starpls`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.1.22`, `0.1.21`

</details>

**Latest Version**: `0.1.22`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/withered-magic/starpls@0.1.22 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.starpls

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/withered-magic/starpls/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
