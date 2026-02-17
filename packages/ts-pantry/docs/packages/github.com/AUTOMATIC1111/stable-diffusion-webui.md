# Stable Diffusion web UI

> Stable Diffusion web UI

## Package Information

- **Domain**: `github.com/AUTOMATIC1111/stable-diffusion-webui`
- **Name**: `Stable Diffusion web UI`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/AUTOMATIC1111/stable-diffusion-webui/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/AUTOMATIC1111/stable-diffusion-webui
```

## Programs

This package provides the following executable programs:

- `stable-diffusion-webui`

## Available Versions

<details>
<summary>Show all 20 versions</summary>

- `1.10.1`, `1.10.0`
- `1.9.4`, `1.9.3`, `1.9.2`, `1.9.1`, `1.9.0`
- `1.8.0`
- `1.7.0`
- `1.6.0`
- `1.5.2`, `1.5.1`, `1.5.0`
- `1.4.0`
- `1.3.2`, `1.3.1`, `1.3.0`
- `1.2.1`, `1.2.0`
- `1.1.0`

</details>

**Latest Version**: `1.10.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/AUTOMATIC1111/stable-diffusion-webui@1.10.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.10`
- `tea.xyz^0  # our scripts use tea/cli`
- `git-scm.org^2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['Stable Diffusion web UI']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/AUTOMATIC1111/stable-diffusion-webui/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
