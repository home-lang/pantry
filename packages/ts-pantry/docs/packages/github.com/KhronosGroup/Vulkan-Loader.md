# Vulkan-Loader

> Vulkan Loader

## Package Information

- **Domain**: `github.com/KhronosGroup/Vulkan-Loader`
- **Name**: `Vulkan-Loader`
- **Homepage**: https://vulkan.lunarg.com/doc/sdk/latest/linux/LoaderInterfaceArchitecture.html
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/KhronosGroup/Vulkan-Loader/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/KhronosGroup/Vulkan-Loader
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 78 versions</summary>

- `1.4.340`, `1.4.339`, `1.4.338`, `1.4.337`, `1.4.336`
- `1.4.335`, `1.4.334`, `1.4.333`, `1.4.332`, `1.4.331`
- `1.4.330`, `1.4.329`, `1.4.328`, `1.4.327`, `1.4.326`
- `1.4.325`, `1.4.324`, `1.4.323`, `1.4.322`, `1.4.321`
- `1.4.320`, `1.4.319`, `1.4.318`, `1.4.317`, `1.4.316`
- `1.4.315`, `1.4.314`, `1.4.313`, `1.4.312`, `1.4.311`
- `1.4.310`, `1.4.309`, `1.4.307`, `1.4.306`, `1.4.305`
- `1.4.304`, `1.4.303`, `1.3.302`, `1.3.301`, `1.3.300`
- `1.3.299`, `1.3.298`, `1.3.297`, `1.3.296`, `1.3.295`
- `1.3.294`, `1.3.293`, `1.3.292`, `1.3.290`, `1.3.289`
- `1.3.288`, `1.3.287`, `1.3.286`, `1.3.285`, `1.3.284`
- `1.3.283`, `1.3.282`, `1.3.281`, `1.3.280`, `1.3.279`
- `1.3.278`, `1.3.277`, `1.3.276`, `1.3.275`, `1.3.274`
- `1.3.273`, `1.3.272`, `1.3.271`, `1.3.270`, `1.3.269`
- `1.3.268`, `1.3.267`, `1.3.266`, `1.3.265`, `1.3.264`
- `1.3.263`, `1.3.262`, `1.3.261`

</details>

**Latest Version**: `1.4.340`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/KhronosGroup/Vulkan-Loader@1.4.340 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/KhronosGroup/Vulkan-Headers`
- `linux:x.org/x11`
- `linux:x.org/xcb`
- `linux:wayland.freedesktop.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['Vulkan-Loader']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/KhronosGroup/Vulkan-Loader/package.yml)
- [Homepage](https://vulkan.lunarg.com/doc/sdk/latest/linux/LoaderInterfaceArchitecture.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
