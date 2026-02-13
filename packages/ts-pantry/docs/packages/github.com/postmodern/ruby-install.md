# ruby-install

> Install Ruby, JRuby, Rubinius, TruffleRuby, or mruby

## Package Information

- **Domain**: `github.com/postmodern/ruby-install`
- **Name**: `ruby-install`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/postmodern/ruby-install/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/postmodern/ruby-install
```

## Programs

This package provides the following executable programs:

- `ruby-install`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `0.10.2`, `0.10.1`, `0.10.0`, `0.9.4`, `0.9.3`
- `0.9.2`, `0.9.1`

</details>

**Latest Version**: `0.10.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/postmodern/ruby-install@0.10.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `tukaani.org/xz`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['ruby-install']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/postmodern/ruby-install/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
