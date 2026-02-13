# glog

> C++ implementation of the Google logging module

## Package Information

- **Domain**: `google.com/glog`
- **Name**: `glog`
- **Homepage**: http://google.github.io/glog/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/google.com/glog/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install google.com/glog
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.7.1`, `0.7.0`, `0.6.0`

</details>

**Latest Version**: `0.7.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +google.com/glog@0.7.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gflags.github.io~2.2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.glog

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/google.com/glog/package.yml)
- [Homepage](http://google.github.io/glog/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
