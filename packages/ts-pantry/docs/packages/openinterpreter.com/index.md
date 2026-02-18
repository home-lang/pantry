# open-interpreter

> A natural language interface for computers

## Package Information

- **Domain**: `openinterpreter.com`
- **Name**: `open-interpreter`
- **Homepage**: <http://openinterpreter.com/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openinterpreter.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openinterpreter.com
```

## Programs

This package provides the following executable programs:

- `interpreter`

## Available Versions

<details>
<summary>Show all 22 versions</summary>

- `0.4.0`
- `0.2.1`, `0.2.0`
- `0.1.18`, `0.1.17`, `0.1.16`, `0.1.15`, `0.1.14`, `0.1.13`, `0.1.12`, `0.1.11`, `0.1.9`, `0.1.8`, `0.1.7`, `0.1.6`, `0.1.5`, `0.1.4`, `0.1.3`, `0.1.2`, `0.1.1`, `0.1.0`
- `0.0.297`

</details>

**Latest Version**: `0.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openinterpreter.com@0.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.10<3.12`
- `github.com/mattrobenolt/jinja2-cli`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['open-interpreter']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openinterpreter.com/package.yml)
- [Homepage](http://openinterpreter.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
