# openapi-generator

> OpenAPI Generator allows generation of API client libraries (SDK generation), server stubs, documentation and configuration automatically given an OpenAPI Spec (v2, v3)

## Package Information

- **Domain**: `openapi-generator.tech`
- **Name**: `openapi-generator`
- **Homepage**: https://openapi-generator.tech/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openapi-generator.tech/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openapi-generator.tech
```

## Programs

This package provides the following executable programs:

- `openapi-generator`

## Available Versions

<details>
<summary>Show all 18 versions</summary>

- `7.19.0`, `7.18.0`, `7.17.0`, `7.16.0`, `7.15.0`
- `7.14.0`, `7.13.0`, `7.12.0`, `7.11.0`, `7.10.0`
- `7.9.0`, `7.8.0`, `7.7.0`, `7.6.0`, `7.5.0`
- `7.4.0`, `7.3.0`, `7.2.0`

</details>

**Latest Version**: `7.19.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openapi-generator.tech@7.19.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openjdk.org^21`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['openapi-generator']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openapi-generator.tech/package.yml)
- [Homepage](https://openapi-generator.tech/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
