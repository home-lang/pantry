# goreleaser

> Deliver Go binaries as fast and easily as possible

## Package Information

- **Domain**: `goreleaser.com`
- **Name**: `goreleaser`
- **Homepage**: https://goreleaser.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/goreleaser.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install goreleaser.com
```

## Programs

This package provides the following executable programs:

- `goreleaser`

## Available Versions

<details>
<summary>Show all 56 versions</summary>

- `2.13.3`, `2.13.2`, `2.13.1`, `2.13.0`, `2.12.7`
- `2.12.6`, `2.12.5`, `2.12.4`, `2.12.3`, `2.12.2`
- `2.12.1`, `2.12.0`, `2.11.2`, `2.11.1`, `2.11.0`
- `2.10.2`, `2.10.1`, `2.10.0`, `2.9.0`, `2.8.2`
- `2.8.1`, `2.8.0`, `2.7.0`, `2.6.1`, `2.6.0`
- `2.5.1`, `2.5.0`, `2.4.8`, `2.4.7`, `2.4.6`
- `2.4.5`, `2.4.4`, `2.4.3`, `2.4.2`, `2.4.1`
- `2.4.0`, `2.3.2`, `2.3.1`, `2.3.0`, `2.2.0`
- `2.1.0`, `2.0.1`, `2.0.0`, `1.26.2`, `1.26.1`
- `1.26.0`, `1.25.1`, `1.25.0`, `1.24.0`, `1.23.0`
- `1.22.1`, `1.22.0`, `1.21.2`, `1.21.1`, `1.21.0`
- `1.20.0`

</details>

**Latest Version**: `2.13.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +goreleaser.com@2.13.3 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.goreleaser

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/goreleaser.com/package.yml)
- [Homepage](https://goreleaser.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
