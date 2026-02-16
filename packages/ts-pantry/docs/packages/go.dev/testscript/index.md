# testscript

> Selected Go-internal packages factored out from the standard library

## Package Information

- **Domain**: `go.dev/testscript`
- **Name**: `testscript`
- **Homepage**: https://github.com/rogpeppe/go-internal/tree/master/cmd/testscript
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/go.dev/testscript/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install go.dev/testscript
```

## Programs

This package provides the following executable programs:

- `testscript`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.14.1`, `1.14.0`, `1.13.1`, `1.12.0`

</details>

**Latest Version**: `1.14.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +go.dev/testscript@1.14.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.testscript

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/go.dev/testscript/package.yml)
- [Homepage](https://github.com/rogpeppe/go-internal/tree/master/cmd/testscript)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
