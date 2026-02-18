# classic.yarnpkg

> The 1.x line is frozen - features and bugfixes now happen on <https://github.com/yarnpkg/berry>

## Package Information

- **Domain**: `classic.yarnpkg.com`
- **Name**: `classic.yarnpkg`
- **Homepage**: <https://yarnpkg.com/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/classic.yarnpkg.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install yarn
```

## Programs

This package provides the following executable programs:

- `yarn`
- `yarnpkg`

## Aliases

This package can also be accessed using these aliases:

- `yarn`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.22.22`, `1.22.21`, `1.22.20`, `1.22.19`

</details>

**Latest Version**: `1.22.22`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +classic.yarnpkg.com@1.22.22 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org>=5`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.yarn

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/classic.yarnpkg.com/package.yml)
- [Homepage](https://yarnpkg.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
