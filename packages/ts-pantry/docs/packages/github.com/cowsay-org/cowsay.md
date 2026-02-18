# cowsay

> apjanke's fork of the classic cowsay project

## Package Information

- **Domain**: `github.com/cowsay-org/cowsay`
- **Name**: `cowsay`
- **Homepage**: <https://cowsay.diamonds>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/cowsay-org/cowsay/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/cowsay-org/cowsay
```

## Programs

This package provides the following executable programs:

- `cowsay`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `3.8.4`, `3.8.3`, `3.8.2`, `3.8.1`, `3.8.0`
- `3.7.0`

</details>

**Latest Version**: `3.8.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/cowsay-org/cowsay@3.8.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `perl.org^5`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cowsay

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/cowsay-org/cowsay/package.yml)
- [Homepage](https://cowsay.diamonds)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
