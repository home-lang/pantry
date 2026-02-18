# xml

> Convert XML to another format (based on XSL or other tools)

## Package Information

- **Domain**: `pagure.io/xmlto`
- **Name**: `xml`
- **Homepage**: <https://pagure.io/xmlto/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pagure.io/xmlto/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pagure.io/xmlto
```

## Programs

This package provides the following executable programs:

- `xmlif`
- `xmlto`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.0.29`, `0.0.28`

</details>

**Latest Version**: `0.0.29`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pagure.io/xmlto@0.0.29 -- $SHELL -i
```

## Dependencies

This package depends on:

- `docbook.org`
- `github.com/util-linux/util-linux`
- `darwin:gnome.org/libxslt`

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

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pagure.io/xmlto/package.yml)
- [Homepage](https://pagure.io/xmlto/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
