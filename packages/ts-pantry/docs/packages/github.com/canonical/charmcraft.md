# charmcraft

> Collaborate, build and publish charmed operators for Kubernetes, Linux and Windows.

## Package Information

- **Domain**: `github.com/canonical/charmcraft`
- **Name**: `charmcraft`
- **Homepage**: https://charmhub.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/canonical/charmcraft/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/canonical/charmcraft
```

## Programs

This package provides the following executable programs:

- `charmcraft`

## Available Versions

<details>
<summary>Show all 15 versions</summary>

- `4.1.0`, `4.0.1`, `4.0.0`, `3.5.3`, `3.5.2`
- `3.5.1`, `3.5.0`, `3.4.3`, `3.3.3`, `3.3.2`
- `3.3.0`, `3.2.2`, `3.2.1`, `2.7.6`, `2.7.5`

</details>

**Latest Version**: `4.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/canonical/charmcraft@4.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`
- `libgit2.org~1.9 # as of v4.1.0`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.charmcraft

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/canonical/charmcraft/package.yml)
- [Homepage](https://charmhub.io)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
