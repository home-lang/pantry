# heroku

> CLI for Heroku

## Package Information

- **Domain**: `heroku.com`
- **Name**: `heroku`
- **Homepage**: https://www.npmjs.com/package/heroku/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/heroku.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install heroku.com
```

## Programs

This package provides the following executable programs:

- `heroku`

## Available Versions

<details>
<summary>Show all 42 versions</summary>

- `10.16.0`, `10.15.1`, `10.15.0`, `10.14.0`, `10.13.2`
- `10.13.1`, `10.13.0`, `10.12.0`, `10.11.0`, `10.10.1`
- `10.10.0`, `10.9.0`, `10.8.0`, `10.7.0`, `10.6.1`
- `10.6.0`, `10.5.0`, `10.4.1`, `10.4.0`, `10.3.0`
- `10.2.0`, `10.1.0`, `10.0.2`, `10.0.1`, `10.0.0`
- `9.5.1`, `9.5.0`, `9.4.0`, `9.3.2`, `9.3.1`
- `9.3.0`, `9.2.1`, `9.2.0`, `9.1.0`, `9.0.0`
- `8.11.5`, `8.11.4`, `8.11.3`, `8.11.2`, `8.11.1`
- `8.11.0`, `8.10.0`

</details>

**Latest Version**: `10.16.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +heroku.com@10.16.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `nodejs.org^20`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.heroku

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/heroku.com/package.yml)
- [Homepage](https://www.npmjs.com/package/heroku/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
