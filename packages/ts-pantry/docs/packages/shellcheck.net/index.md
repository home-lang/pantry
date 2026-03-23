# shellcheck

> ShellCheck, a static analysis tool for shell scripts

## Package Information

- **Domain**: `shellcheck.net`
- **Name**: `shellcheck`
- **Homepage**: <https://www.shellcheck.net/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/shellcheck.net/package.yml)

## Installation

```bash
# Install with pantry
pantry install shellcheck.net
```

## Programs

This package provides the following executable programs:

- `shellcheck`

## Available Versions

<details>
<summary>Show all 20 versions</summary>

- `0.11.0`
- `0.10.0`
- `0.9.0`
- `0.8.0`
- `0.7.2`, `0.7.1`, `0.7.0`
- `0.6.0`
- `0.5.0`
- `0.4.7`, `0.4.6`, `0.4.5`, `0.4.4`, `0.4.3`, `0.4.2`, `0.4.1`, `0.4.0`
- `0.3.8`, `0.3.7`, `0.3.6`

</details>

**Latest Version**: `0.11.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +shellcheck.net@0.11.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `sourceware.org/libffi@3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.shellcheck

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/shellcheck.net/package.yml)
- [Homepage](https://www.shellcheck.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
