# rbenv

> Manage your app's Ruby environment

## Package Information

- **Domain**: `github.com/rbenv/rbenv`
- **Name**: `rbenv`
- **Homepage**: https://rbenv.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/rbenv/rbenv/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/rbenv/rbenv
```

## Programs

This package provides the following executable programs:

- `rbenv`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.3.2`, `1.3.1`, `1.3.0`, `1.2.0`

</details>

**Latest Version**: `1.3.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/rbenv/rbenv@1.3.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `ruby-lang.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rbenv

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/rbenv/rbenv/package.yml)
- [Homepage](https://rbenv.org)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
