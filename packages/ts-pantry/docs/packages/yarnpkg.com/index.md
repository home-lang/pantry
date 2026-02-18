# yarn

> 📦🐈 Active development trunk for Yarn ⚒

## Package Information

- **Domain**: `yarnpkg.com`
- **Name**: `yarn`
- **Homepage**: <https://yarnpkg.com/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/yarnpkg.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install yarnpkg.com
```

## Programs

This package provides the following executable programs:

- `yarn`
- `yarnpkg`

## Available Versions

<details>
<summary>Show all 48 versions</summary>

- `4.12.0`
- `4.11.0`
- `4.10.3`, `4.10.2`, `4.10.1`, `4.10.0`
- `4.9.4`, `4.9.3`, `4.9.2`, `4.9.1`, `4.9.0`
- `4.8.1`, `4.8.0`
- `4.7.0`
- `4.6.0`
- `4.5.3`, `4.5.2`, `4.5.1`, `4.5.0`
- `4.4.1`, `4.4.0`
- `4.3.1`, `4.3.0`
- `4.2.2`, `4.2.1`, `4.2.0`
- `4.1.1`, `4.1.0`
- `4.0.2`, `4.0.1`, `4.0.0`
- `3.8.7`, `3.8.6`, `3.8.5`, `3.8.4`, `3.8.3`, `3.8.2`, `3.8.1`, `3.8.0`
- `3.7.0`
- `3.6.4`, `3.6.3`, `3.6.2`, `3.6.1`, `3.6.0`
- `3.5.1`, `3.5.0`
- `3.4.1`

</details>

**Latest Version**: `4.12.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +yarnpkg.com@4.12.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org`

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

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/yarnpkg.com/package.yml)
- [Homepage](https://yarnpkg.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
