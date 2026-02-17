# xcodegen

> Generate your Xcode project from a spec file and your folder structure

## Package Information

- **Domain**: `github.com/yonaskolb/XcodeGen`
- **Name**: `xcodegen`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/yonaskolb/XcodeGen/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/yonaskolb/XcodeGen
```

## Programs

This package provides the following executable programs:

- `xcodegen`

## Available Versions

<details>
<summary>Show all 14 versions</summary>

- `2.44.1`, `2.44.0`
- `2.43.0`
- `2.42.0`
- `2.41.0`
- `2.40.1`, `2.40.0`
- `2.39.1`, `2.39.0`
- `2.38.0`
- `2.37.0`
- `2.36.1`, `2.36.0`
- `2.35.0`

</details>

**Latest Version**: `2.44.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/yonaskolb/XcodeGen@2.44.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xcodegen

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/yonaskolb/XcodeGen/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
