# spacer

> Small command-line utility for adding spacers to command output

## Package Information

- **Domain**: `github.com/samwho/spacer`
- **Name**: `spacer`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/samwho/spacer/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/samwho/spacer
```

## Programs

This package provides the following executable programs:

- `spacer`

## Available Versions

<details>
<summary>Show all 12 versions</summary>

- `0.5.0`, `0.4.5`, `0.4.2`, `0.4.1`, `0.3.9`
- `0.3.8`, `0.3.7`, `0.3.5`, `0.3.3`, `0.3.2`
- `0.3.1`, `0.3.0`

</details>

**Latest Version**: `0.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/samwho/spacer@0.5.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.spacer

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/samwho/spacer/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
