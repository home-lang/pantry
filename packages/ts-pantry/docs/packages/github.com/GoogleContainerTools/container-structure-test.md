# container-structure-test

> validate the structure of your container images

## Package Information

- **Domain**: `github.com/GoogleContainerTools/container-structure-test`
- **Name**: `container-structure-test`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/GoogleContainerTools/container-structure-test/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/GoogleContainerTools/container-structure-test
```

## Programs

This package provides the following executable programs:

- `container-structure-test`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `1.22.1`, `1.22.0`, `1.21.1`, `1.21.0`, `1.20.0`
- `1.19.3`, `1.19.2`, `1.19.1`

</details>

**Latest Version**: `1.22.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/GoogleContainerTools/container-structure-test@1.22.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['container-structure-test']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/GoogleContainerTools/container-structure-test/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
