# rucio-client

> Rucio - Scientific Data Management

## Package Information

- **Domain**: `rucio.cern.ch/rucio-client`
- **Name**: `rucio-client`
- **Homepage**: http://rucio.cern.ch
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rucio.cern.ch/rucio-client/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rucio.cern.ch/rucio-client
```

## Programs

This package provides the following executable programs:

- `rucio`
- `rucio-admin`

## Available Versions

<details>
<summary>Show all 42 versions</summary>

- `39.1.0`, `39.0.0`, `38.5.1`, `38.5.0`, `38.4.0`
- `38.3.0`, `38.2.0`, `38.1.0`, `38.0.0`, `37.7.1`
- `37.7.0`, `37.6.0`, `37.5.0`, `37.4.0`, `37.3.0`
- `37.2.0`, `37.1.0`, `37.0.0`, `36.5.0`, `36.4.0`
- `36.3.0`, `36.2.0`, `36.1.0`, `35.8.2`, `35.8.1`
- `35.8.0`, `35.7.0`, `35.6.1`, `35.6.0`, `35.5.0`
- `35.4.1`, `35.4.0`, `35.3.0`, `35.2.1`, `35.2.0`
- `35.1.1`, `35.1.0`, `35.0.1`, `35.0.0`, `34.6.0`
- `34.5.0`, `34.4.3`

</details>

**Latest Version**: `39.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rucio.cern.ch/rucio-client@39.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['rucio-client']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rucio.cern.ch/rucio-client/package.yml)
- [Homepage](http://rucio.cern.ch)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
