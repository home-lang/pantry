# arduino-cli

> Arduino command-line interface

## Package Information

- **Domain**: `arduino.github.io/arduino-cli`
- **Name**: `arduino-cli`
- **Homepage**: https://arduino.github.io/arduino-cli/latest/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/arduino.github.io/arduino-cli/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install arduino.github.io/arduino-cli
```

## Programs

This package provides the following executable programs:

- `arduino-cli`

## Available Versions

<details>
<summary>Show all 24 versions</summary>

- `1.4.1`, `1.4.0`, `1.3.1`, `1.3.0`, `1.2.2`
- `1.2.0`, `1.1.1`, `1.1.0`, `1.0.4`, `1.0.3`
- `1.0.2`, `1.0.1`, `1.0.0`, `0.35.3`, `0.35.2`
- `0.35.1`, `0.35.0`, `0.34.2`, `0.34.1`, `0.34.0`
- `0.33.1`, `0.33.0`, `0.32.3`, `0.32.2`

</details>

**Latest Version**: `1.4.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +arduino.github.io/arduino-cli@1.4.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['arduino-cli']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/arduino.github.io/arduino-cli/package.yml)
- [Homepage](https://arduino.github.io/arduino-cli/latest/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
