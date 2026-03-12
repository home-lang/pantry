# mvn

> Java-based project management

## Package Information

- **Domain**: `maven.apache.org`
- **Name**: `mvn`
- **Homepage**: <https://maven.apache.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/maven.apache.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install maven
```

## Programs

This package provides the following executable programs:

- `mvn`
- `mvnDebug`
- `mvnyjp`

## Aliases

This package can also be accessed using these aliases:

- `maven`

## Available Versions

<details>
<summary>Show all 15 versions</summary>

- `3.9.14`, `3.9.13`, `3.9.12`, `3.9.11`, `3.9.10`, `3.9.9`, `3.9.8`, `3.9.7`, `3.9.6`, `3.9.5`, `3.9.4`, `3.9.3`
- `3.8.9`, `3.8.7`
- `3.6.3`

</details>

**Latest Version**: `3.9.14`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +maven.apache.org@3.9.14 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openjdk.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.maven

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/maven.apache.org/package.yml)
- [Homepage](https://maven.apache.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
