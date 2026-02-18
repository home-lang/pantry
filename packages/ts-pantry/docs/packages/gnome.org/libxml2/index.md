# xml

> Read-only mirror of <https://gitlab.gnome.org/GNOME/libxml2>

## Package Information

- **Domain**: `gnome.org/libxml2`
- **Name**: `xml`
- **Homepage**: <http://xmlsoft.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/libxml2/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnome.org/libxml2
```

## Programs

This package provides the following executable programs:

- `xml2-config`
- `xmlcatalog`
- `xmllint`

## Available Versions

<details>
<summary>Show all 40 versions</summary>

- `2.15.1`, `2.15.0`
- `2.14.6`, `2.14.5`, `2.14.4`, `2.14.3`, `2.14.2`, `2.14.1`, `2.14.0`
- `2.13.9`, `2.13.8`, `2.13.7`, `2.13.6`, `2.13.5`, `2.13.4`, `2.13.3`, `2.13.2`, `2.13.1`, `2.13.0`
- `2.12.9`, `2.12.8`, `2.12.7`, `2.12.6`, `2.12.5`, `2.12.4`, `2.12.3`, `2.12.2`, `2.12.1`, `2.12.0`
- `2.11.9`, `2.11.8`, `2.11.7`, `2.11.6`, `2.11.4`, `2.11.3`, `2.11.2`, `2.11.1`, `2.11.0`
- `2.10.4`, `2.10.3`

</details>

**Latest Version**: `2.15.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnome.org/libxml2@2.15.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xml

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/libxml2/package.yml)
- [Homepage](http://xmlsoft.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
