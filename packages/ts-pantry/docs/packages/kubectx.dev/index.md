# kube

> Tool that can switch between kubectl contexts easily and create aliases

## Package Information

- **Domain**: `kubectx.dev`
- **Name**: `kube`
- **Homepage**: <https://kubectx.dev>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/kubectx.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install kubectx.dev
```

## Programs

This package provides the following executable programs:

- `kubectx`
- `kubens`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.9.5`, `0.9.4`

</details>

**Latest Version**: `0.9.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +kubectx.dev@0.9.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/junegunn/fzf`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.kube

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/kubectx.dev/package.yml)
- [Homepage](https://kubectx.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
