# jinja2

> CLI for the Jinja2 templating language

## Package Information

- **Domain**: `github.com/mattrobenolt/jinja2-cli`
- **Name**: `jinja2`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mattrobenolt/jinja2-cli/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/mattrobenolt/jinja2-cli
```

## Programs

This package provides the following executable programs:

- `jinja2`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.0.0`, `0.8.2`

</details>

**Latest Version**: `1.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/mattrobenolt/jinja2-cli@1.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.7<3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.jinja2

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mattrobenolt/jinja2-cli/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
