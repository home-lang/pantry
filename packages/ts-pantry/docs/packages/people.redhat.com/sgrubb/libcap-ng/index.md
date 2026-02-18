# libcap-ng

> Libcap-ng is a library for Linux that makes using posix capabilities easy.

## Package Information

- **Domain**: `people.redhat.com/sgrubb/libcap-ng`
- **Name**: `libcap-ng`
- **Homepage**: <https://people.redhat.com/sgrubb/libcap-ng/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/people.redhat.com/sgrubb/libcap-ng/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install people.redhat.com/sgrubb/libcap-ng
```

## Programs

This package provides the following executable programs:

- `captest`
- `filecap`
- `netcap`
- `pscap`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.8.5`, `0.8.4`, `0.8.3`

</details>

**Latest Version**: `0.8.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +people.redhat.com/sgrubb/libcap-ng@0.8.5 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['libcap-ng']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/people.redhat.com/sgrubb/libcap-ng/package.yml)
- [Homepage](https://people.redhat.com/sgrubb/libcap-ng/)
- [Back to Package Catalog](../../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
