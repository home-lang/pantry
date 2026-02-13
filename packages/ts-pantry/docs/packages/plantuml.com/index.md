# plantuml

> Generate diagrams from textual description

## Package Information

- **Domain**: `plantuml.com`
- **Name**: `plantuml`
- **Homepage**: https://plantuml.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/plantuml.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install plantuml.com
```

## Programs

This package provides the following executable programs:

- `plantuml`

## Available Versions

<details>
<summary>Show all 26 versions</summary>

- `1.2026.1`, `1.2026.0`, `1.2025.10`, `1.2025.9`, `1.2025.8`
- `1.2025.7`, `1.2025.6`, `1.2025.5`, `1.2025.4`, `1.2025.3`
- `1.2025.2`, `1.2025.1`, `1.2025.0`, `1.2024.8`, `1.2024.7`
- `1.2024.6`, `1.2024.5`, `1.2024.4`, `1.2024.3`, `1.2024.2`
- `1.2024.1`, `1.2024.0`, `1.2023.13`, `1.2023.12`, `1.2023.11`
- `1.2023.10`

</details>

**Latest Version**: `1.2026.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +plantuml.com@1.2026.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `graphviz.org`
- `openjdk.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.plantuml

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/plantuml.com/package.yml)
- [Homepage](https://plantuml.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
