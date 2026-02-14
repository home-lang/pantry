# mackup

> Keep your application settings in sync (OS X/Linux)

## Package Information

- **Domain**: `github.com/lra/mackup`
- **Name**: `mackup`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/lra/mackup/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/lra/mackup
```

## Programs

This package provides the following executable programs:

- `mackup`

## Available Versions

<details>
<summary>Show all 18 versions</summary>

- `0.10.2`, `0.10.1`, `0.10.0`, `0.9.6`, `0.9.5`
- `0.9.4`, `0.9.3`, `0.9.2`, `0.9.1`, `0.9.0`
- `0.8.43`, `0.8.42`, `0.8.41`, `0.8.40`, `0.8.39`
- `0.8.38`, `0.8.37`, `0.8.36`

</details>

**Latest Version**: `0.10.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/lra/mackup@0.10.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3<3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mackup

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/lra/mackup/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
