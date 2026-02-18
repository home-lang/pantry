# cppunit

> Unit testing framework for C++

## Package Information

- **Domain**: `freedesktop.org/cppunit`
- **Name**: `cppunit`
- **Homepage**: <https://wiki.freedesktop.org/www/Software/cppunit/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/cppunit/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install freedesktop.org/cppunit
```

## Programs

This package provides the following executable programs:

- `cppunit-config`
- `DllPlugInTester`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.13.2`

</details>

**Latest Version**: `1.13.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +freedesktop.org/cppunit@1.13.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cppunit

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/cppunit/package.yml)
- [Homepage](https://wiki.freedesktop.org/www/Software/cppunit/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
