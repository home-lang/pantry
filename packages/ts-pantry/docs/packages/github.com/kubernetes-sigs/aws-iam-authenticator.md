# aws-iam-authenticator

> A tool to use AWS IAM credentials to authenticate to a Kubernetes cluster

## Package Information

- **Domain**: `github.com/kubernetes-sigs/aws-iam-authenticator`
- **Name**: `aws-iam-authenticator`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kubernetes-sigs/aws-iam-authenticator/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/kubernetes-sigs/aws-iam-authenticator
```

## Programs

This package provides the following executable programs:

- `aws-iam-authenticator`

## Available Versions

<details>
<summary>Show all 28 versions</summary>

- `0.7.10`, `0.7.9`, `0.7.8`, `0.7.7`, `0.7.6`
- `0.7.5`, `0.7.4`, `0.7.3`, `0.7.2`, `0.7.1`
- `0.6.31`, `0.6.30`, `0.6.29`, `0.6.28`, `0.6.27`
- `0.6.26`, `0.6.25`, `0.6.24`, `0.6.23`, `0.6.22`
- `0.6.21`, `0.6.14`, `0.6.13`, `0.6.12`, `0.6.11`
- `0.5.27`, `0.5.21`, `0.5.20`

</details>

**Latest Version**: `0.7.10`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/kubernetes-sigs/aws-iam-authenticator@0.7.10 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['aws-iam-authenticator']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kubernetes-sigs/aws-iam-authenticator/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
