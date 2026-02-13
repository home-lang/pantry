# vscode cli

> Command-line interface built-in Visual Studio Code

## Package Information

- **Domain**: `microsoft.com/code-cli`
- **Name**: `vscode cli`
- **Homepage**: https://code.visualstudio.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/microsoft.com/code-cli/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install microsoft.com/code-cli
```

## Programs

This package provides the following executable programs:

- `code`

## Available Versions

<details>
<summary>Show all 36 versions</summary>

- `1.108.1`, `1.108.0`, `1.107.1`, `1.107.0`, `1.106.3`
- `1.106.2`, `1.106.1`, `1.106.0`, `1.105.1`, `1.105.0`
- `1.104.3`, `1.104.2`, `1.104.1`, `1.104.0`, `1.103.2`
- `1.103.1`, `1.103.0`, `1.102.3`, `1.102.2`, `1.102.1`
- `1.102.0`, `1.101.2`, `1.101.1`, `1.101.0`, `1.100.3`
- `1.100.2`, `1.100.1`, `1.100.0`, `1.99.3`, `1.99.2`
- `1.99.1`, `1.99.0`, `1.98.2`, `1.98.1`, `1.98.0`
- `1.97.2`

</details>

**Latest Version**: `1.108.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +microsoft.com/code-cli@1.108.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org@1.1`
- `zlib.net@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['vscode cli']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/microsoft.com/code-cli/package.yml)
- [Homepage](https://code.visualstudio.com)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
