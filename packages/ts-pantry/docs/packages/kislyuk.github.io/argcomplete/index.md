# argcomplete

> Python and tab completion, better together.

## Package Information

- **Domain**: `kislyuk.github.io/argcomplete`
- **Name**: `argcomplete`
- **Homepage**: https://kislyuk.github.io/argcomplete/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/kislyuk.github.io/argcomplete/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install kislyuk.github.io/argcomplete
```

## Programs

This package provides the following executable programs:

- `activate-global-python-argcomplete`
- `register-python-argcomplete`
- `python-argcomplete-check-easy-install-script`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `3.6.3`, `3.6.2`, `3.6.1`, `3.6.0`, `3.5.3`
- `3.5.2`, `3.5.1`, `3.5.0`, `3.4.0`, `3.3.0`
- `3.2.3`

</details>

**Latest Version**: `3.6.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +kislyuk.github.io/argcomplete@3.6.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.argcomplete

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/kislyuk.github.io/argcomplete/package.yml)
- [Homepage](https://kislyuk.github.io/argcomplete/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
