# license-plist

> A license list generator of all your dependencies for iOS applications

## Package Information

- **Domain**: `github.com/mono0926/LicensePlist`
- **Name**: `license-plist`
- **Homepage**: <https://www.slideshare.net/mono0926/licenseplist-a-license-list-generator-of-all-your-dependencies-for-ios-applications>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mono0926/LicensePlist/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/mono0926/LicensePlist
```

## Programs

This package provides the following executable programs:

- `license-plist`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `3.27.2`, `3.27.1`, `3.27.0`
- `3.26.0`
- `3.25.1`

</details>

**Latest Version**: `3.27.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/mono0926/LicensePlist@3.27.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['license-plist']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mono0926/LicensePlist/package.yml)
- [Homepage](https://www.slideshare.net/mono0926/licenseplist-a-license-list-generator-of-all-your-dependencies-for-ios-applications)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
