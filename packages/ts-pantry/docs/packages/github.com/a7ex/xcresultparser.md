# xcresultparser

> Parse the binary xcresult bundle from Xcode builds and testruns

## Package Information

- **Domain**: `github.com/a7ex/xcresultparser`
- **Name**: `xcresultparser`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/a7ex/xcresultparser/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/a7ex/xcresultparser
```

## Programs

This package provides the following executable programs:

- `xcresultparser`

## Available Versions

<details>
<summary>Show all 21 versions</summary>

- `1.9.4`, `1.9.3`, `1.9.2`, `1.9.1`, `1.9.0`
- `1.8.5`, `1.8.4`, `1.8.3`, `1.8.2`, `1.8.1`
- `1.8.0`, `1.7.2`, `1.7.1`, `1.7.0`, `1.6.5`
- `1.6.4`, `1.6.3`, `1.6.2`, `1.6.1`, `1.6.0`
- `1.5.2`

</details>

**Latest Version**: `1.9.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/a7ex/xcresultparser@1.9.4 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xcresultparser

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/a7ex/xcresultparser/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
