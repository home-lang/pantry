# apptainer

> Application container and unprivileged sandbox platform for Linux

## Package Information

- **Domain**: `apptainer.org`
- **Name**: `apptainer`
- **Homepage**: https://apptainer.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/apptainer.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install apptainer.org
```

## Programs

This package provides the following executable programs:

- `apptainer`
- `run-singularity`
- `singularity`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `1.4.5`, `1.4.4`, `1.4.3`, `1.4.2`, `1.4.1`
- `1.4.0`, `1.3.6`, `1.3.5`, `1.3.4`, `1.3.3`

</details>

**Latest Version**: `1.4.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +apptainer.org@1.4.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/seccomp/libseccomp@2`
- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.apptainer

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/apptainer.org/package.yml)
- [Homepage](https://apptainer.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
