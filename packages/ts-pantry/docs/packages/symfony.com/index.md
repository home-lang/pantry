# symfony

> The Symfony CLI tool

## Package Information

- **Domain**: `symfony.com`
- **Name**: `symfony`
- **Homepage**: https://symfony.com/download
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/symfony.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install symfony.com
```

## Programs

This package provides the following executable programs:

- `symfony`

## Available Versions

<details>
<summary>Show all 58 versions</summary>

- `5.16.1`, `5.16.0`, `5.15.1`, `5.15.0`, `5.14.2`
- `5.14.1`, `5.14.0`, `5.13.0`, `5.12.0`, `5.11.0`
- `5.10.9`, `5.10.8`, `5.10.7`, `5.10.6`, `5.10.5`
- `5.10.4`, `5.10.3`, `5.10.2`, `5.10.1`, `5.10.0`
- `5.9.1`, `5.9.0`, `5.8.19`, `5.8.18`, `5.8.17`
- `5.8.16`, `5.8.15`, `5.8.14`, `5.8.13`, `5.8.12`
- `5.8.11`, `5.8.10`, `5.8.9`, `5.8.8`, `5.8.7`
- `5.8.6`, `5.8.5`, `5.8.4`, `5.8.3`, `5.8.2`
- `5.8.1`, `5.8.0`, `5.7.8`, `5.7.7`, `5.7.6`
- `5.7.5`, `5.7.4`, `5.7.3`, `5.7.2`, `5.7.1`
- `5.7.0`, `5.6.2`, `5.6.1`, `5.6.0`, `5.5.10`
- `5.5.9`, `5.5.8`, `5.5.7`

</details>

**Latest Version**: `5.16.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +symfony.com@5.16.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `php.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.symfony

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/symfony.com/package.yml)
- [Homepage](https://symfony.com/download)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
