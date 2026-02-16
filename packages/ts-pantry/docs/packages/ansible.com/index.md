# ansible

> Ansible is a radically simple IT automation platform that makes your applications and systems easier to deploy and maintain. Automate everything from code deployment to network configuration to cloud management, in a language that approaches plain English, using SSH, with no agents to install on remote systems. <https://docs.ansible.com.>

## Package Information

- **Domain**: `ansible.com`
- **Name**: `ansible`
- **Homepage**: <https://www.ansible.com/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ansible.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ansible.com
```

## Programs

This package provides the following executable programs:

- `ansible`
- `ansible-config`
- `ansible-connection`
- `ansible-console`
- `ansible-doc`
- `ansible-galaxy`
- `ansible-inventory`
- `ansible-playbook`
- `ansible-pull`
- `ansible-test`
- `ansible-vault`

## Available Versions

<details>
<summary>Show all 88 versions</summary>

- `2.20.1`, `2.20.0`, `2.19.6`, `2.19.5`, `2.19.4`
- `2.19.3`, `2.19.2`, `2.19.1`, `2.19.0`, `2.18.12`
- `2.18.11`, `2.18.10`, `2.18.9`, `2.18.8`, `2.18.7`
- `2.18.6`, `2.18.5`, `2.18.4`, `2.18.3`, `2.18.2`
- `2.18.1`, `2.18.0`, `2.17.14`, `2.17.13`, `2.17.12`
- `2.17.11`, `2.17.10`, `2.17.9`, `2.17.7`, `2.17.6`
- `2.17.5`, `2.17.4`, `2.17.3`, `2.17.2`, `2.17.1`
- `2.17.0`, `2.16.16`, `2.16.15`, `2.16.14`, `2.16.13`
- `2.16.12`, `2.16.11`, `2.16.10`, `2.16.9`, `2.16.8`
- `2.16.7`, `2.16.6`, `2.16.5`, `2.16.4`, `2.16.3`
- `2.16.2`, `2.16.1`, `2.16.0`, `2.15.13`, `2.15.12`
- `2.15.11`, `2.15.10`, `2.15.9`, `2.15.8`, `2.15.7`
- `2.15.6`, `2.15.5`, `2.15.4`, `2.15.3`, `2.15.2`
- `2.15.1`, `2.15.0`, `2.14.18`, `2.14.17`, `2.14.16`
- `2.14.15`, `2.14.14`, `2.14.13`, `2.14.12`, `2.14.11`
- `2.14.10`, `2.14.9`, `2.14.8`, `2.14.7`, `2.14.6`
- `2.14.5`, `2.14.4`, `2.14.3`, `2.13.13`, `2.13.12`
- `2.13.11`, `2.13.10`, `2.13.9`

</details>

**Latest Version**: `2.20.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ansible.com@2.20.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ansible

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ansible.com/package.yml)
- [Homepage](https://www.ansible.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
