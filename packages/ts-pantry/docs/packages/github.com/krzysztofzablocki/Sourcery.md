# Sourcery

> Meta-programming for Swift, stop writing boilerplate code.

## Package Information

- **Domain**: `github.com/krzysztofzablocki/Sourcery`
- **Name**: `Sourcery`
- **Homepage**: http://merowing.info
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/krzysztofzablocki/Sourcery/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/krzysztofzablocki/Sourcery
```

## Programs

This package provides the following executable programs:

- `sourcery`

## Available Versions

<details>
<summary>Show all 20 versions</summary>

- `2.3.0`
- `2.2.7`, `2.2.6`, `2.2.5`, `2.2.4`, `2.2.3`, `2.2.2`, `2.2.1`, `2.2.0`
- `2.1.8`, `2.1.7`, `2.1.6`, `2.1.5`, `2.1.4`, `2.1.3`, `2.1.2`, `2.1.1`, `2.1.0`
- `2.0.3`, `2.0.2`

</details>

**Latest Version**: `2.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/krzysztofzablocki/Sourcery@2.3.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.Sourcery

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/krzysztofzablocki/Sourcery/package.yml)
- [Homepage](http://merowing.info)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
