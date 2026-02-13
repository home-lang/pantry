# Jenkins X

> Jenkins X provides automated CI+CD for Kubernetes with Preview Environments on Pull Requests using Cloud Native pipelines from Tekton

## Package Information

- **Domain**: `jenkins-x.io`
- **Name**: `Jenkins X`
- **Homepage**: https://jenkins-x.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/jenkins-x.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install jenkins-x.io
```

## Programs

This package provides the following executable programs:

- `jx`

## Available Versions

<details>
<summary>Show all 83 versions</summary>

- `3.16.43`, `3.16.41`, `3.16.40`, `3.16.39`, `3.16.35`
- `3.16.34`, `3.16.29`, `3.16.28`, `3.16.26`, `3.16.25`
- `3.16.24`, `3.16.21`, `3.16.19`, `3.16.18`, `3.16.13`
- `3.16.10`, `3.16.4`, `3.16.1`, `3.16.0`, `3.11.116`
- `3.11.113`, `3.11.111`, `3.11.108`, `3.11.107`, `3.11.105`
- `3.11.92`, `3.11.90`, `3.11.87`, `3.11.81`, `3.11.78`
- `3.11.77`, `3.11.76`, `3.11.75`, `3.11.74`, `3.11.71`
- `3.11.70`, `3.11.69`, `3.11.66`, `3.11.65`, `3.11.63`
- `3.11.56`, `3.11.52`, `3.11.49`, `3.11.48`, `3.11.45`
- `3.11.44`, `3.11.41`, `3.11.39`, `3.11.38`, `3.11.27`
- `3.11.26`, `3.11.25`, `3.11.24`, `3.11.21`, `3.11.17`
- `3.11.14`, `3.11.11`, `3.11.10`, `3.11.8`, `3.11.7`
- `3.11.5`, `3.11.4`, `3.11.2`, `3.11.1`, `3.11.0`
- `3.10.182`, `3.10.181`, `3.10.180`, `3.10.178`, `3.10.177`
- `3.10.176`, `3.10.172`, `3.10.170`, `3.10.169`, `3.10.167`
- `3.10.166`, `3.10.161`, `3.10.160`, `3.10.158`, `3.10.157`
- `3.10.156`, `3.10.155`, `3.10.154`

</details>

**Latest Version**: `3.16.43`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +jenkins-x.io@3.16.43 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['Jenkins X']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/jenkins-x.io/package.yml)
- [Homepage](https://jenkins-x.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
