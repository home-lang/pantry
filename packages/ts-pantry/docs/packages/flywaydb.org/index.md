# flyway

> Database version control to control migrations

## Package Information

- **Domain**: `flywaydb.org`
- **Name**: `flyway`
- **Homepage**: https://flywaydb.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/flywaydb.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install flywaydb.org
```

## Programs

This package provides the following executable programs:

- `flyway`

## Available Versions

<details>
<summary>Show all 60 versions</summary>

- `11.20.2`, `11.20.1`, `11.20.0`, `11.19.1`, `11.19.0`
- `11.18.0`, `11.17.2`, `11.17.1`, `11.17.0`, `11.16.0`
- `11.15.0`, `11.14.1`, `11.14.0`, `11.13.3`, `11.13.2`
- `11.13.1`, `11.13.0`, `11.12.0`, `11.11.2`, `11.8.2`
- `11.8.1`, `11.8.0`, `11.7.2`, `11.7.1`, `11.7.0`
- `11.6.0`, `11.5.0`, `11.4.1`, `11.4.0`, `11.3.4`
- `11.3.3`, `11.3.2`, `11.3.1`, `11.3.0`, `11.2.0`
- `11.1.1`, `11.1.0`, `11.0.1`, `11.0.0`, `10.22.0`
- `10.21.0`, `10.20.1`, `10.20.0`, `10.19.0`, `10.18.2`
- `10.18.1`, `10.18.0`, `10.17.3`, `10.17.2`, `10.17.1`
- `10.17.0`, `10.16.0`, `10.15.2`, `10.15.0`, `10.14.0`
- `10.13.0`, `10.12.0`, `10.11.1`, `10.11.0`, `10.10.0`

</details>

**Latest Version**: `11.20.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +flywaydb.org@11.20.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openjdk.org^21`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.flyway

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/flywaydb.org/package.yml)
- [Homepage](https://flywaydb.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
