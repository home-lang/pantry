# pod

> Dependency manager for Cocoa projects

## Package Information

- **Domain**: `cocoapods.org`
- **Name**: `pod`
- **Homepage**: https://cocoapods.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/cocoapods.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install cocoapods.org
```

## Programs

This package provides the following executable programs:

- `pod`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `1.16.2`, `1.16.1`, `1.16.0`
- `1.15.2`, `1.15.1`, `1.15.0`
- `1.14.3`, `1.14.2`, `1.14.1`, `1.14.0`
- `1.13.0`
- `1.12.1`
- `1.5.0`

</details>

**Latest Version**: `1.16.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +cocoapods.org@1.16.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `ruby-lang.org~3.2`
- `sourceware.org/libffi^3`
- `rubygems.org^3`
- `git-scm.org^2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pod

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/cocoapods.org/package.yml)
- [Homepage](https://cocoapods.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
