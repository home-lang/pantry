# tmux

> Terminal multiplexer

## Package Information

- **Domain**: `github.com/tmux/tmux`
- **Name**: `tmux`
- **Homepage**: https://tmux.github.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/tmux/tmux/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/tmux/tmux
```

## Programs

This package provides the following executable programs:

- `tmux`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `3.6a`
- `3.6.0`
- `3.5a`
- `3.5.0`
- `3.4.0`
- `3.3a`
- `3.3.0`

</details>

**Latest Version**: `3.6a`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/tmux/tmux@3.6a -- $SHELL -i
```

## Dependencies

This package depends on:

- `libevent.org^2.0`
- `invisible-island.net/ncurses`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tmux

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/tmux/tmux/package.yml)
- [Homepage](https://tmux.github.io/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
