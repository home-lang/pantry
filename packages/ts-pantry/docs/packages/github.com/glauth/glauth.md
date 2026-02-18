# glauth

> A lightweight LDAP server for development, home use, or CI

## Package Information

- **Domain**: `github.com/glauth/glauth`
- **Name**: `glauth`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/glauth/glauth/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/glauth/glauth
```

## Programs

This package provides the following executable programs:

- `glauth`
- `glauth-setup`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.4.0`

</details>

**Latest Version**: `2.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/glauth/glauth@2.4.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.glauth

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/glauth/glauth/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
