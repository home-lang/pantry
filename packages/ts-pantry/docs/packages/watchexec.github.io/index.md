# watchexec

> Executes commands in response to file modifications

## Package Information

- **Domain**: `watchexec.github.io`
- **Name**: `watchexec`
- **Homepage**: <https://watchexec.github.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/watchexec.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install watchexec.github.io
```

## Programs

This package provides the following executable programs:

- `watchexec`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `2.4.1`, `2.4.0`
- `2.3.3`, `2.3.2`, `2.3.1`, `2.3.0`
- `2.2.1`, `2.2.0`
- `2.1.2`

</details>

**Latest Version**: `2.4.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +watchexec.github.io@2.4.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.watchexec

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/watchexec.github.io/package.yml)
- [Homepage](https://watchexec.github.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
