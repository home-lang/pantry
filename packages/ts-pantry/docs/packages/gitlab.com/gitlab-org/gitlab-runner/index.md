# gitlab-runner

> Official GitLab CI runner

## Package Information

- **Domain**: `gitlab.com/gitlab-org/gitlab-runner`
- **Name**: `gitlab-runner`
- **Homepage**: https://gitlab.com/gitlab-org/gitlab-runner
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gitlab.com/gitlab-org/gitlab-runner/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gitlab.com/gitlab-org/gitlab-runner
```

## Programs

This package provides the following executable programs:

- `gitlab-runner`

## Available Versions

<details>
<summary>Show all 100 versions</summary>

- `18.8.0`, `18.7.2`, `18.7.1`, `18.7.0`, `18.6.6`
- `18.6.5`, `18.6.4`, `18.6.3`, `18.6.2`, `18.6.1`
- `18.6.0`, `18.5.0`, `18.4.0`, `18.3.1`, `18.3.0`
- `18.2.2`, `18.2.1`, `18.2.0`, `18.1.3`, `18.1.2`
- `18.1.1`, `18.1.0`, `18.0.5`, `18.0.4`, `18.0.3`
- `18.0.2`, `18.0.1`, `18.0.0`, `17.11.4`, `17.11.3`
- `17.11.2`, `17.11.1`, `17.11.0`, `17.10.2`, `17.10.1`
- `17.10.0`, `17.9.3`, `17.9.2`, `17.9.1`, `17.9.0`
- `17.8.5`, `17.8.4`, `17.8.3`, `17.8.2`, `17.8.1`
- `17.8.0`, `17.7.1`, `17.7.0`, `17.6.0`, `17.5.5`
- `17.5.4`, `17.5.3`, `17.5.2`, `17.5.1`, `17.5.0`
- `17.4.2`, `17.4.1`, `17.4.0`, `17.3.3`, `17.3.2`
- `17.3.1`, `17.3.0`, `17.2.3`, `17.2.2`, `17.2.1`
- `17.2.0`, `17.1.2`, `17.1.1`, `17.1.0`, `17.0.3`
- `17.0.2`, `17.0.1`, `17.0.0`, `16.11.4`, `16.11.3`
- `16.11.2`, `16.11.1`, `16.11.0`, `16.10.1`, `16.10.0`
- `16.9.2`, `16.9.1`, `16.9.0`, `16.8.1`, `16.8.0`
- `16.7.0`, `16.6.2`, `16.6.1`, `16.6.0`, `16.5.0`
- `16.4.2`, `16.4.1`, `16.4.0`, `16.3.3`, `16.3.2`
- `16.3.1`, `16.3.0`, `16.2.3`, `16.2.2`, `16.2.1`

</details>

**Latest Version**: `18.8.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gitlab.com/gitlab-org/gitlab-runner@18.8.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['gitlab-runner']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gitlab.com/gitlab-org/gitlab-runner/package.yml)
- [Homepage](https://gitlab.com/gitlab-org/gitlab-runner)
- [Back to Package Catalog](../../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
