# go

> The Go programming language

## Package Information

- **Domain**: `go.dev`
- **Name**: `go`
- **Homepage**: https://go.dev
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/go.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install go.dev
```

## Programs

This package provides the following executable programs:

- `go`
- `gofmt`

## Available Versions

<details>
<summary>Show all 85 versions</summary>

- `1.25.6`, `1.25.5`, `1.25.4`, `1.25.3`, `1.25.2`
- `1.25.1`, `1.25.0`, `1.24.12`, `1.24.11`, `1.24.10`
- `1.24.9`, `1.24.8`, `1.24.7`, `1.24.6`, `1.24.5`
- `1.24.4`, `1.24.3`, `1.24.2`, `1.24.1`, `1.24.0`
- `1.23.12`, `1.23.11`, `1.23.10`, `1.23.9`, `1.23.8`
- `1.23.7`, `1.23.6`, `1.23.5`, `1.23.4`, `1.23.3`
- `1.23.2`, `1.23.1`, `1.23.0`, `1.22.12`, `1.22.11`
- `1.22.10`, `1.22.9`, `1.22.8`, `1.22.7`, `1.22.6`
- `1.22.5`, `1.22.4`, `1.22.3`, `1.22.2`, `1.22.1`
- `1.22.0`, `1.21.13`, `1.21.12`, `1.21.11`, `1.21.10`
- `1.21.8`, `1.21.7`, `1.21.6`, `1.21.5`, `1.21.4`
- `1.21.3`, `1.21.2`, `1.21.1`, `1.21.0`, `1.20.14`
- `1.20.13`, `1.20.12`, `1.20.11`, `1.20.10`, `1.20.9`
- `1.20.8`, `1.20.7`, `1.20.6`, `1.20.5`, `1.20.4`
- `1.20.3`, `1.20.2`, `1.20.1`, `1.19.12`, `1.19.11`
- `1.19.10`, `1.19.9`, `1.19.8`, `1.19.5`, `1.19.4`
- `1.19.3`, `1.19.2`, `1.18.10`, `1.17.13`, `1.16.15`

</details>

**Latest Version**: `1.25.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +go.dev@1.25.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1  # for ca-certificates`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.go

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/go.dev/package.yml)
- [Homepage](https://go.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
