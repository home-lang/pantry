# pkg

> Package your Node.js project into an executable

## Package Information

- **Domain**: `vercel.com/pkg`
- **Name**: `pkg`
- **Homepage**: https://npmjs.com/pkg
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/vercel.com/pkg/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install vercel.com/pkg
```

## Programs

This package provides the following executable programs:

- `pkg`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `5.8.1`

</details>

**Latest Version**: `5.8.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +vercel.com/pkg@5.8.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pkg

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/vercel.com/pkg/package.yml)
- [Homepage](https://npmjs.com/pkg)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
