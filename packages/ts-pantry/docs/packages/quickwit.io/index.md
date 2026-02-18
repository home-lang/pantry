# quickwit

> Cloud-native search engine for observability. An open-source alternative to Datadog, Elasticsearch, Loki, and Tempo.

## Package Information

- **Domain**: `quickwit.io`
- **Name**: `quickwit`
- **Homepage**: <https://quickwit.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/quickwit.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install quickwit.io
```

## Programs

This package provides the following executable programs:

- `quickwit`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `0.8.2`, `0.8.1`, `0.8.0`
- `0.7.1`, `0.7.0`
- `0.6.5`, `0.6.4`

</details>

**Latest Version**: `0.8.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +quickwit.io@0.8.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `protobuf.dev^25`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.quickwit

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/quickwit.io/package.yml)
- [Homepage](https://quickwit.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
