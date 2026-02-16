# jenkins-lts

> Extendable open source continuous integration server

## Package Information

- **Domain**: `jenkins.io`
- **Name**: `jenkins-lts`
- **Homepage**: https://www.jenkins.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/jenkins.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install jenkins.io
```

## Programs

This package provides the following executable programs:

- `jenkins-lts`
- `jenkins-lts-cli`

## Available Versions

<details>
<summary>Show all 27 versions</summary>

- `2.541.1`, `2.528.3`, `2.528.2`, `2.528.1`, `2.516.3`
- `2.516.2`, `2.516.1`, `2.504.3`, `2.504.2`, `2.504.1`
- `2.492.3`, `2.492.2`, `2.492.1`, `2.479.3`, `2.479.2`
- `2.479.1`, `2.462.3`, `2.462.2`, `2.462.1`, `2.452.3`
- `2.452.2`, `2.452.1`, `2.440.3`, `2.440.2`, `2.440.1`
- `2.426.3`, `2.426.2`

</details>

**Latest Version**: `2.541.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +jenkins.io@2.541.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openjdk.org<20`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['jenkins-lts']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/jenkins.io/package.yml)
- [Homepage](https://www.jenkins.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
