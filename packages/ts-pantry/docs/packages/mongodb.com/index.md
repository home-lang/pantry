# mongodb

> The MongoDB Database

## Package Information

- **Domain**: `mongodb.com`
- **Name**: `mongodb`
- **Homepage**: https://www.mongodb.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mongodb.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mongodb.com
```

## Programs

This package provides the following executable programs:

- `install_compass`
- `mongod`
- `mongos`

## Available Versions

<details>
<summary>Show all 54 versions</summary>

- `8.2.3`, `8.2.2`, `8.2.1`, `8.2.0`, `8.1.3`
- `8.1.2`, `8.1.1`, `8.1.0`, `8.0.17`, `8.0.16`
- `8.0.15`, `8.0.14`, `8.0.13`, `8.0.12`, `8.0.11`
- `8.0.10`, `8.0.9`, `8.0.8`, `8.0.7`, `8.0.6`
- `8.0.5`, `8.0.4`, `8.0.3`, `8.0.2`, `8.0.1`
- `8.0.0`, `7.3.4`, `7.3.3`, `7.0.28`, `7.0.27`
- `7.0.26`, `7.0.25`, `7.0.24`, `7.0.23`, `7.0.22`
- `7.0.21`, `7.0.20`, `7.0.19`, `7.0.18`, `7.0.17`
- `7.0.16`, `7.0.15`, `7.0.14`, `6.0.27`, `6.0.26`
- `6.0.25`, `6.0.24`, `6.0.23`, `6.0.22`, `6.0.21`
- `6.0.20`, `6.0.19`, `6.0.18`, `6.0.17`

</details>

**Latest Version**: `8.2.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mongodb.com@8.2.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `curl.se@8`
- `openssl.org@1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mongodb

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mongodb.com/package.yml)
- [Homepage](https://www.mongodb.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
