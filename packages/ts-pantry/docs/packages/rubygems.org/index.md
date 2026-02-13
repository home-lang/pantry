# rubygems

> Powerful, clean, object-oriented scripting language

## Package Information

- **Domain**: `rubygems.org`
- **Name**: `rubygems`
- **Homepage**: https://www.ruby-lang.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rubygems.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rubygems.org
```

## Programs

This package provides the following executable programs:

- `bundle`
- `bundler`
- `gem`

## Available Versions

<details>
<summary>Show all 65 versions</summary>

- `4.0.4`, `4.0.3`, `4.0.2`, `4.0.1`, `4.0.0`
- `3.7.2`, `3.7.1`, `3.7.0`, `3.6.9`, `3.6.8`
- `3.6.7`, `3.6.6`, `3.6.5`, `3.6.4`, `3.6.3`
- `3.6.2`, `3.6.1`, `3.6.0`, `3.5.23`, `3.5.22`
- `3.5.21`, `3.5.20`, `3.5.19`, `3.5.18`, `3.5.17`
- `3.5.16`, `3.5.15`, `3.5.14`, `3.5.13`, `3.5.12`
- `3.5.11`, `3.5.10`, `3.5.9`, `3.5.8`, `3.5.7`
- `3.5.6`, `3.5.5`, `3.5.4`, `3.5.3`, `3.5.2`
- `3.5.1`, `3.5.0`, `3.4.22`, `3.4.21`, `3.4.20`
- `3.4.19`, `3.4.18`, `3.4.17`, `3.4.16`, `3.4.15`
- `3.4.14`, `3.4.13`, `3.4.10`, `3.4.9`, `3.4.7`
- `3.4.6`, `3.4.5`, `3.4.3`, `3.4.2`, `3.4.1`
- `3.4.0`, `3.3.27`, `3.3.26`, `3.3.25`, `3.2.34`

</details>

**Latest Version**: `4.0.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rubygems.org@4.0.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `ruby-lang.org>=2.3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rubygems

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rubygems.org/package.yml)
- [Homepage](https://www.ruby-lang.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
