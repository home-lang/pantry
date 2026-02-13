# laravel

> The Laravel application installer.

## Package Information

- **Domain**: `laravel.com`
- **Name**: `laravel`
- **Homepage**: https://laravel.com/docs
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/laravel.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install laravel.com
```

## Programs

This package provides the following executable programs:

- `laravel`

## Available Versions

<details>
<summary>Show all 29 versions</summary>

- `5.24.2`, `5.24.1`, `5.24.0`, `5.23.2`, `5.23.1`
- `5.23.0`, `5.22.0`, `5.21.0`, `5.20.0`, `5.19.0`
- `5.18.0`, `5.17.0`, `5.16.0`, `5.15.0`, `5.14.1`
- `5.14.0`, `5.13.0`, `5.12.2`, `5.12.1`, `5.12.0`
- `5.11.2`, `5.11.1`, `5.11.0`, `5.10.0`, `5.9.2`
- `5.9.1`, `5.9.0`, `5.8.5`, `5.8.3`

</details>

**Latest Version**: `5.24.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +laravel.com@5.24.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `php.net^8.2`
- `getcomposer.org^2.7`
- `linux:info-zip.org/unzip^6`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.laravel

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/laravel.com/package.yml)
- [Homepage](https://laravel.com/docs)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
