# rebar3

> Erlang build tool that makes it easy to compile and test Erlang applications and releases.

## Package Information

- **Domain**: `rebar3.org`
- **Name**: `rebar3`
- **Homepage**: https://rebar3.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rebar3.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rebar3.org
```

## Programs

This package provides the following executable programs:

- `rebar3`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `3.26.0`, `3.25.1`, `3.25.0`, `3.24.0`, `3.23.0`

</details>

**Latest Version**: `3.26.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rebar3.org@3.26.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `erlang.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rebar3

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rebar3.org/package.yml)
- [Homepage](https://rebar3.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
