# swagger-codegen

> swagger-codegen contains a template-driven engine to generate documentation, API clients and server stubs in different languages by parsing your OpenAPI / Swagger definition.

## Package Information

- **Domain**: `swagger.io/swagger-codegen`
- **Name**: `swagger-codegen`
- **Homepage**: https://swagger.io/tools/swagger-codegen/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/swagger.io/swagger-codegen/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install swagger.io/swagger-codegen
```

## Programs

This package provides the following executable programs:

- `swagger-codegen`

## Available Versions

<details>
<summary>Show all 32 versions</summary>

- `3.0.76`, `3.0.75`, `3.0.74`, `3.0.73`, `3.0.72`
- `3.0.71`, `3.0.70`, `3.0.69`, `3.0.68`, `3.0.67`
- `3.0.66`, `3.0.65`, `3.0.64`, `3.0.63`, `3.0.62`
- `3.0.61`, `3.0.60`, `3.0.59`, `3.0.58`, `3.0.57`
- `3.0.56`, `3.0.55`, `3.0.54`, `2.4.50`, `2.4.49`
- `2.4.48`, `2.4.47`, `2.4.45`, `2.4.44`, `2.4.43`
- `2.4.42`, `2.4.41`

</details>

**Latest Version**: `3.0.76`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +swagger.io/swagger-codegen@3.0.76 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openjdk.org^11`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['swagger-codegen']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/swagger.io/swagger-codegen/package.yml)
- [Homepage](https://swagger.io/tools/swagger-codegen/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
