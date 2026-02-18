# swiftenv

> Swift Version Manager

## Package Information

- **Domain**: `github.com/kylef/swiftenv`
- **Name**: `swiftenv`
- **Homepage**: https://swiftenv.fuller.li/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kylef/swiftenv/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/kylef/swiftenv
```

## Programs

This package provides the following executable programs:

- `swiftenv`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.4.0`

</details>

**Latest Version**: `1.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/kylef/swiftenv@1.4.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.swiftenv

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kylef/swiftenv/package.yml)
- [Homepage](https://swiftenv.fuller.li/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
