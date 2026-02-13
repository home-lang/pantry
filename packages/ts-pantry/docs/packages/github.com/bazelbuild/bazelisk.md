# bazel

> A user-friendly launcher for Bazel.

## Package Information

- **Domain**: `github.com/bazelbuild/bazelisk`
- **Name**: `bazel`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/bazelbuild/bazelisk/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/bazelbuild/bazelisk
```

## Programs

This package provides the following executable programs:

- `bazel`
- `bazelisk`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `1.28.1`, `1.28.0`, `1.27.0`, `1.26.0`, `1.25.0`
- `1.24.1`, `1.24.0`, `1.23.0`, `1.22.1`, `1.22.0`
- `1.21.0`, `1.20.0`, `1.19.0`

</details>

**Latest Version**: `1.28.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/bazelbuild/bazelisk@1.28.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bazel

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/bazelbuild/bazelisk/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
