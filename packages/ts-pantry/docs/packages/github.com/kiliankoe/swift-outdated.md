# swift-outdated

> A swift subcommand for displaying when your dependencies (SwiftPM or Xcode) are out of date

## Package Information

- **Domain**: `github.com/kiliankoe/swift-outdated`
- **Name**: `swift-outdated`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kiliankoe/swift-outdated/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/kiliankoe/swift-outdated
```

## Programs

This package provides the following executable programs:

- `swift-outdated`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `0.11.0`
- `0.10.1`, `0.10.0`
- `0.9.1`, `0.9.0`
- `0.8.1`, `0.8.0`
- `0.7.0`
- `0.6.0`
- `0.5.1`

</details>

**Latest Version**: `0.11.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/kiliankoe/swift-outdated@0.11.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['swift-outdated']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kiliankoe/swift-outdated/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
