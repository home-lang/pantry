# radicle

> Radicle CLI

## Package Information

- **Domain**: `radicle.org`
- **Name**: `radicle`
- **Homepage**: <https://app.radicle.network/alt-clients.radicle.eth/radicle-cli>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/radicle.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install radicle.org
```

## Programs

This package provides the following executable programs:

- `rad`
- `git-remote-rad`
- `rad-account`
- `rad-auth`
- `rad-checkout`
- `rad-clone`
- `rad-edit`
- `rad-ens`
- `rad-gov`
- `rad-help`
- `rad-init`
- `rad-inspect`
- `rad-issue`
- `rad-ls`
- `rad-merge`
- `rad-patch`
- `rad-path`
- `rad-pull`
- `rad-push`
- `rad-remote`
- `rad-reward`
- `rad-rm`
- `rad-self`
- `rad-sync`
- `rad-track`
- `rad-untrack`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.6.1`

</details>

**Latest Version**: `0.6.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +radicle.org@0.6.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.radicle

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/radicle.org/package.yml)
- [Homepage](https://app.radicle.network/alt-clients.radicle.eth/radicle-cli)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
