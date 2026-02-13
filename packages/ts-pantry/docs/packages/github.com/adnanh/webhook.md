# webhook

> webhook is a lightweight incoming webhook server to run shell commands

## Package Information

- **Domain**: `github.com/adnanh/webhook`
- **Name**: `webhook`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/adnanh/webhook/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/adnanh/webhook
```

## Programs

This package provides the following executable programs:

- `webhook`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.8.2`, `2.8.1`

</details>

**Latest Version**: `2.8.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/adnanh/webhook@2.8.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.webhook

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/adnanh/webhook/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
