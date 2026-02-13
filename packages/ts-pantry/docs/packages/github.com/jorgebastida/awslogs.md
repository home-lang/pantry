# awslogs

> Simple command-line tool to read AWS CloudWatch logs

## Package Information

- **Domain**: `github.com/jorgebastida/awslogs`
- **Name**: `awslogs`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jorgebastida/awslogs/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/jorgebastida/awslogs
```

## Programs

This package provides the following executable programs:

- `awslogs`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.15.0`, `0.14.0`

</details>

**Latest Version**: `0.15.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/jorgebastida/awslogs@0.15.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org^3.11`
- `github.com/benjaminp/six`
- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.awslogs

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/jorgebastida/awslogs/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
