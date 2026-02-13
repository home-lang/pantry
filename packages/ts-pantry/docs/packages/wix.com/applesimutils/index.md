# applesimutils

> A collection of command-line utils for Apple simulators.

## Package Information

- **Domain**: `wix.com/applesimutils`
- **Name**: `applesimutils`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/wix.com/applesimutils/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install wix.com/applesimutils
```

## Programs

This package provides the following executable programs:

- `applesimutils`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.9.12`, `0.9.10`

</details>

**Latest Version**: `0.9.12`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +wix.com/applesimutils@0.9.12 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.applesimutils

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/wix.com/applesimutils/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
