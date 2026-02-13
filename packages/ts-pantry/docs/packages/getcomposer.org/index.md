# composer

> Dependency Manager for PHP

## Package Information

- **Domain**: `getcomposer.org`
- **Name**: `composer`
- **Homepage**: https://getcomposer.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/getcomposer.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install getcomposer.org
```

## Programs

This package provides the following executable programs:

- `composer`
- `composer.phar`

## Available Versions

<details>
<summary>Show all 39 versions</summary>

- `2.9.4`, `2.9.3`, `2.9.2`, `2.9.1`, `2.9.0`
- `2.8.12`, `2.8.11`, `2.8.10`, `2.8.9`, `2.8.8`
- `2.8.7`, `2.8.6`, `2.8.5`, `2.8.4`, `2.8.3`
- `2.8.2`, `2.8.1`, `2.8.0`, `2.7.9`, `2.7.8`
- `2.7.7`, `2.7.6`, `2.7.5`, `2.7.4`, `2.7.3`
- `2.7.2`, `2.7.1`, `2.7.0`, `2.6.6`, `2.6.5`
- `2.6.4`, `2.6.3`, `2.6.2`, `2.6.1`, `2.6.0`
- `2.5.8`, `2.2.26`, `2.2.24`, `2.2.23`

</details>

**Latest Version**: `2.9.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +getcomposer.org@2.9.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `php.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.composer

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/getcomposer.org/package.yml)
- [Homepage](https://getcomposer.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
