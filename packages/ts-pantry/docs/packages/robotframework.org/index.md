# robot

> Generic automation framework for acceptance testing and RPA

## Package Information

- **Domain**: `robotframework.org`
- **Name**: `robot`
- **Homepage**: https://robotframework.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/robotframework.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install robotframework.org
```

## Programs

This package provides the following executable programs:

- `robot`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `7.4.1`, `7.4.0`, `7.3.2`, `7.3.1`, `7.3.0`
- `7.2.2`

</details>

**Latest Version**: `7.4.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +robotframework.org@7.4.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.robot

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/robotframework.org/package.yml)
- [Homepage](https://robotframework.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
