# overmind

> Process manager for Procfile-based applications and tmux

## Package Information

- **Domain**: `github.com/darthsim/overmind`
- **Name**: `overmind`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/darthsim/overmind/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/darthsim/overmind
```

## Programs

This package provides the following executable programs:

- `overmind`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `2.5.1`, `2.5.0`, `2.4.0`

</details>

**Latest Version**: `2.5.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/darthsim/overmind@2.5.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/tmux/tmux`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.overmind

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/darthsim/overmind/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
