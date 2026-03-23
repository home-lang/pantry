# Visual Studio Code

> A lightweight but powerful source code editor.

## Package Information

- **Domain**: `code.visualstudio.com`
- **Name**: `Visual Studio Code`
- **Homepage**: <https://code.visualstudio.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/code.visualstudio.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install code.visualstudio.com
```

## Programs

This package provides the following executable programs:

- `code`

## Aliases

This package can also be accessed using these aliases:

- `vscode`
- `code`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.96.4`, `1.96.3`, `1.96.2`

</details>

**Latest Version**: `1.96.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +code.visualstudio.com@1.96.4 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.vscode

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/code.visualstudio.com/package.yml)
- [Homepage](https://code.visualstudio.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
