# eksctl

> Simple command-line tool for creating clusters on Amazon EKS

## Package Information

- **Domain**: `eksctl.io`
- **Name**: `eksctl`
- **Homepage**: https://eksctl.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/eksctl.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install eksctl.io
```

## Programs

This package provides the following executable programs:

- `eksctl`

## Available Versions

<details>
<summary>Show all 68 versions</summary>

- `0.221.0`, `0.220.0`, `0.219.0`, `0.218.0`, `0.217.0`
- `0.216.0`, `0.215.0`, `0.214.0`, `0.213.0`, `0.212.0`
- `0.211.0`, `0.210.0`, `0.209.0`, `0.208.0`, `0.207.0`
- `0.206.0`, `0.205.0`, `0.204.0`, `0.203.0`, `0.202.0`
- `0.201.0`, `0.200.0`, `0.199.0`, `0.198.0`, `0.197.0`
- `0.196.0`, `0.195.0`, `0.194.0`, `0.193.0`, `0.192.0`
- `0.191.0`, `0.190.0`, `0.189.0`, `0.188.0`, `0.187.0`
- `0.186.0`, `0.185.0`, `0.184.0`, `0.183.0`, `0.182.0`
- `0.181.0`, `0.180.0`, `0.179.0`, `0.178.0`, `0.177.0`
- `0.176.0`, `0.175.0`, `0.174.0`, `0.173.0`, `0.172.0`
- `0.171.0`, `0.170.0`, `0.169.0`, `0.168.0`, `0.167.0`
- `0.166.0`, `0.165.0`, `0.164.0`, `0.163.0`, `0.162.0`
- `0.161.0`, `0.160.0`, `0.159.0`, `0.158.0`, `0.157.0`
- `0.156.0`, `0.155.0`, `0.154.0`

</details>

**Latest Version**: `0.221.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +eksctl.io@0.221.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/kubernetes-sigs/aws-iam-authenticator`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.eksctl

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/eksctl.io/package.yml)
- [Homepage](https://eksctl.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
