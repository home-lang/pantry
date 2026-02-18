# xcodeproj

> Create and modify Xcode projects from Ruby.

## Package Information

- **Domain**: `cocoapods.org/xcodeproj`
- **Name**: `xcodeproj`
- **Homepage**: <https://cocoapods.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/cocoapods.org/xcodeproj/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install cocoapods.org/xcodeproj
```

## Programs

This package provides the following executable programs:

- `xcodeproj`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.27.0`

</details>

**Latest Version**: `1.27.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +cocoapods.org/xcodeproj@1.27.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `ruby-lang.org~3.2`
- `rubygems.org^3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xcodeproj

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/cocoapods.org/xcodeproj/package.yml)
- [Homepage](https://cocoapods.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
