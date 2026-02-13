# lcov

> Graphical front-end for GCC's coverage testing tool (gcov)

## Package Information

- **Domain**: `github.com/linux-test-project/lcov`
- **Name**: `lcov`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/linux-test-project/lcov/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/linux-test-project/lcov
```

## Programs

This package provides the following executable programs:

- `lcov`
- `geninfo`
- `genhtml`
- `gendesc`
- `genpng`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `2.4.0`, `2.3.2`, `2.3.1`, `2.3.0`, `2.2.0`
- `1.16.0`

</details>

**Latest Version**: `2.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/linux-test-project/lcov@2.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `perl.org>=5`
- `python.org@3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.lcov

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/linux-test-project/lcov/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
