# ko

> Build and deploy Go applications on Kubernetes

## Package Information

- **Domain**: `ko.build`
- **Name**: `ko`
- **Homepage**: https://ko.build
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ko.build/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ko.build
```

## Programs

This package provides the following executable programs:

- `ko`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `0.18.1`, `0.18.0`
- `0.17.1`, `0.17.0`
- `0.16.0`

</details>

**Latest Version**: `0.18.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ko.build@0.18.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ko

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ko.build/package.yml)
- [Homepage](https://ko.build)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
