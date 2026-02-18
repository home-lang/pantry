# kotlinlang

> Statically typed programming language for the JVM

## Package Information

- **Domain**: `kotlinlang.org`
- **Name**: `kotlinlang`
- **Homepage**: <https://kotlinlang.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/kotlinlang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install kotlinlang.org
```

## Programs

This package provides the following executable programs:

- `kapt`
- `kotlin`
- `kotlinc`
- `kotlinc-js`
- `kotlinc-jvm`

## Available Versions

<details>
<summary>Show all 22 versions</summary>

- `2.3.10`, `2.3.0`
- `2.2.21`, `2.2.20`, `2.2.10`, `2.2.0`
- `2.1.21`, `2.1.20`, `2.1.10`, `2.1.0`
- `2.0.21`, `2.0.20`, `2.0.10`, `2.0.0`
- `1.9.25`, `1.9.24`, `1.9.23`, `1.9.22`, `1.9.21`, `1.9.20`, `1.9.10`, `1.9.0`

</details>

**Latest Version**: `2.3.10`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +kotlinlang.org@2.3.10 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openjdk.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.kotlinlang

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/kotlinlang.org/package.yml)
- [Homepage](https://kotlinlang.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
