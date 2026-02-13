# reattach-to-user-namespace

> Notes and workarounds for accessing the Mac OS X pasteboard in tmux sessions. Note: The pu branch (“Proposed Updates”) may be rewound without notice.

## Package Information

- **Domain**: `github.com/ChrisJohnsen/tmux-MacOSX-pasteboard`
- **Name**: `reattach-to-user-namespace`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ChrisJohnsen/tmux-MacOSX-pasteboard/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/ChrisJohnsen/tmux-MacOSX-pasteboard
```

## Programs

This package provides the following executable programs:

- `reattach-to-user-namespace`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.9.0`

</details>

**Latest Version**: `2.9.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/ChrisJohnsen/tmux-MacOSX-pasteboard@2.9.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['reattach-to-user-namespace']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/ChrisJohnsen/tmux-MacOSX-pasteboard/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
