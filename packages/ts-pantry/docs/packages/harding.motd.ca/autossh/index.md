# autossh

> Automatically restart SSH sessions and tunnels

## Package Information

- **Domain**: `harding.motd.ca/autossh`
- **Name**: `autossh`
- **Homepage**: <https://www.harding.motd.ca/autossh/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/harding.motd.ca/autossh/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install harding.motd.ca/autossh
```

## Programs

This package provides the following executable programs:

- `autossh`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.4f`

</details>

**Latest Version**: `1.4f`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +harding.motd.ca/autossh@1.4f -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssh.com`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.autossh

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/harding.motd.ca/autossh/package.yml)
- [Homepage](https://www.harding.motd.ca/autossh/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
