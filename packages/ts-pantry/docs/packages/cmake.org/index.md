# cmake

> Mirror of CMake upstream repository

## Package Information

- **Domain**: `cmake.org`
- **Name**: `cmake`
- **Homepage**: https://www.cmake.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/cmake.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install cmake.org
```

## Programs

This package provides the following executable programs:

- `cmake`
- `ccmake`
- `cpack`
- `ctest`

## Available Versions

<details>
<summary>Show all 74 versions</summary>

- `4.2.2`, `4.2.1`, `4.2.0`, `4.1.4`, `4.1.3`
- `4.1.2`, `4.1.1`, `4.1.0`, `4.0.5`, `4.0.4`
- `4.0.3`, `4.0.2`, `4.0.1`, `4.0.0`, `3.31.10`
- `3.31.9`, `3.31.8`, `3.31.7`, `3.31.6`, `3.31.5`
- `3.31.4`, `3.31.3`, `3.31.2`, `3.31.1`, `3.31.0`
- `3.30.9`, `3.30.8`, `3.30.7`, `3.30.6`, `3.30.5`
- `3.30.4`, `3.30.3`, `3.30.2`, `3.30.1`, `3.30.0`
- `3.29.9`, `3.29.8`, `3.29.7`, `3.29.6`, `3.29.5`
- `3.29.4`, `3.29.3`, `3.29.2`, `3.29.1`, `3.29.0`
- `3.28.6`, `3.28.5`, `3.28.4`, `3.28.3`, `3.28.2`
- `3.28.1`, `3.28.0`, `3.27.9`, `3.27.8`, `3.27.7`
- `3.27.6`, `3.27.5`, `3.27.4`, `3.27.3`, `3.27.2`
- `3.27.1`, `3.27.0`, `3.26.6`, `3.26.5`, `3.26.4`
- `3.26.3`, `3.26.2`, `3.26.1`, `3.26.0`, `3.25.3`
- `3.25.2`, `3.25.1`, `3.24.4`, `3.24.2`

</details>

**Latest Version**: `4.2.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +cmake.org@4.2.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se>=5<8.13`
- `zlib.net@1`
- `sourceware.org/bzip2@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cmake

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/cmake.org/package.yml)
- [Homepage](https://www.cmake.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
