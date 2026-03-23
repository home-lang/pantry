# Slack

> A messaging and collaboration platform for teams.

## Package Information

- **Domain**: `slack.com`
- **Name**: `Slack`
- **Homepage**: <https://slack.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/slack.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install slack.com
```

## Programs

This package provides the following executable programs:

- `slack`

## Aliases

This package can also be accessed using these aliases:

- `slack`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `4.41.105`, `4.41.104`, `4.41.103`

</details>

**Latest Version**: `4.41.105`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +slack.com@4.41.105 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.slack

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/slack.com/package.yml)
- [Homepage](https://slack.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
