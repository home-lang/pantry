# buildifier

> Format bazel BUILD files with a standard convention

## Package Information

- **Domain**: `github.com/bazelbuild/buildtools`
- **Name**: `buildifier`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/bazelbuild/buildtools/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/bazelbuild/buildtools
```

## Programs

This package provides the following executable programs:

- `buildifier`

## Available Versions

<details>
<summary>Show all 12 versions</summary>

- `8.5.1`
- `8.2.1`, `8.2.0`
- `8.0.3`, `8.0.2`, `8.0.1`, `8.0.0`
- `7.3.1`
- `7.1.2`, `7.1.1`, `7.1.0`
- `6.4.0`

</details>

**Latest Version**: `8.5.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/bazelbuild/buildtools@8.5.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.buildifier

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/bazelbuild/buildtools/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
