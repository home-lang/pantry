# docker-credential-ecr-login

> Automatically gets credentials for Amazon ECR on docker push/docker pull

## Package Information

- **Domain**: `github.com/awslabs/amazon-ecr-credential-helper`
- **Name**: `docker-credential-ecr-login`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/awslabs/amazon-ecr-credential-helper/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/awslabs/amazon-ecr-credential-helper
```

## Programs

This package provides the following executable programs:

- `docker-credential-ecr-login`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `0.11.0`
- `0.10.1`, `0.10.0`
- `0.9.1`, `0.9.0`
- `0.8.0`
- `0.7.1`

</details>

**Latest Version**: `0.11.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/awslabs/amazon-ecr-credential-helper@0.11.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['docker-credential-ecr-login']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/awslabs/amazon-ecr-credential-helper/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
