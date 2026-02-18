# Package Catalog

This comprehensive catalog lists all 0+ packages available in ts-pkgx, organized by category.

Each package can be accessed using `getPackage(name)` or directly via `pantry.domain`.

## Quick Stats

- **Total Packages**: 0
- **Categories**: 27
- **Last Updated**: 2026-02-18T16:26:19.023Z

## Table of Contents

- [Programming Languages](#programming-languages) (0 packages)
- [Artificial Intelligence](#artificial-intelligence) (0 packages)
- [Databases](#databases) (0 packages)
- [Web Development](#web-development) (0 packages)
- [DevOps](#devops) (0 packages)
- [Container & Kubernetes Tools](#container-kubernetes-tools) (0 packages)
- [Monitoring & Observability](#monitoring-observability) (0 packages)
- [Build Tools & Automation](#build-tools-automation) (0 packages)
- [Package Managers](#package-managers) (0 packages)
- [Editors & IDEs](#editors-ides) (0 packages)
- [CLI Tools & Utilities](#cli-tools-utilities) (0 packages)
- [Networking](#networking) (0 packages)
- [Security & Cryptography](#security-cryptography) (0 packages)
- [Multimedia](#multimedia) (0 packages)
- [Graphics Libraries](#graphics-libraries) (0 packages)
- [Gaming & Game Development](#gaming-game-development) (0 packages)
- [Cloud Platforms](#cloud-platforms) (0 packages)
- [Mobile Development](#mobile-development) (0 packages)
- [Testing](#testing) (0 packages)
- [Cryptocurrency](#cryptocurrency) (0 packages)
- [Financial Tools](#financial-tools) (0 packages)
- [Documentation & Text Processing](#documentation-text-processing) (0 packages)
- [System Administration](#system-administration) (0 packages)
- [Scientific Computing](#scientific-computing) (0 packages)
- [Embedded & IoT](#embedded-iot) (0 packages)
- [Version Control](#version-control) (0 packages)
- [Other Utilities](#other-utilities) (0 packages)

## Usage Examples

### Basic Usage

```typescript
import { getPackage, pantry } from 'ts-pkgx'

// Get a package by domain
const nodePackage = pantry.nodejsorg

// Get a package by alias
const nodeByAlias = getPackage('node')

// Access package properties
console.log(`Package: ${nodePackage.name} - ${nodePackage.description}`)
console.log(`Install: ${nodePackage.installCommand}`)
console.log(`Programs: ${nodePackage.programs.join(', ')}`)
```

### Advanced Usage

```typescript
// Find packages by category
const databases = [
  pantry.postgresqlorg,
  pantry.mysqlcom,
  pantry.redisio,
  pantry.mongodbcom
]

// Get all available versions
const nodeVersions = pantry.nodejsorg.versions
console.log(`Node.js versions: ${nodeVersions.slice(0, 5).join(', ')}...`)

// Check dependencies
const nodeDeps = pantry.nodejsorg.dependencies
console.log(`Node.js dependencies: ${nodeDeps.join(', ')}`)
```

### Installation Examples

```bash
# Install using pkgx
pkgx node
pkgx python
pkgx rust

# Install specific versions
pkgx node@20
pkgx python@3.11

# Install multiple packages
pkgx node python rust
```

## Package Information

Each package includes:

- **Name**: Short identifier for the package
- **Domain**: Full domain identifier
- **Description**: What the package does
- **Programs**: Executable programs provided
- **Versions**: Available versions
- **Dependencies**: Required dependencies
- **Companions**: Related packages
- **Install Command**: How to install with pkgx

## Contributing

To add or update packages, see the pkgx [contribution guide](https://docs.pkgx.sh/appendix/packaging/pantry).
