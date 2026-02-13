# ansible-lint

> ansible-lint checks playbooks for practices and behavior that could potentially be improved and can fix some of the most common ones for you

## Package Information

- **Domain**: `ansible.com/ansible-lint`
- **Name**: `ansible-lint`
- **Homepage**: https://ansible-lint.readthedocs.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ansible.com/ansible-lint/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ansible.com/ansible-lint
```

## Programs

This package provides the following executable programs:

- `ansible-lint`

## Available Versions

<details>
<summary>Show all 37 versions</summary>

- `26.1.1`, `26.1.0`, `25.12.2`, `25.12.1`, `25.12.0`
- `25.11.1`, `25.11.0`, `25.9.2`, `25.9.1`, `25.9.0`
- `25.8.2`, `25.8.1`, `25.8.0`, `25.7.0`, `25.6.1`
- `25.6.0`, `25.5.0`, `25.4.0`, `25.2.1`, `25.2.0`
- `25.1.3`, `25.1.2`, `25.1.1`, `25.1.0`, `24.12.2`
- `24.12.1`, `24.12.0`, `24.10.0`, `24.9.2`, `24.9.1`
- `24.9.0`, `24.7.0`, `24.6.1`, `24.6.0`, `24.5.0`
- `24.2.3`, `24.2.2`

</details>

**Latest Version**: `26.1.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ansible.com/ansible-lint@26.1.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['ansible-lint']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ansible.com/ansible-lint/package.yml)
- [Homepage](https://ansible-lint.readthedocs.io/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
