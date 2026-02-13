# jupyter

> JupyterLab computational environment.

## Package Information

- **Domain**: `jupyter.org`
- **Name**: `jupyter`
- **Homepage**: https://jupyterlab.readthedocs.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/jupyter.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install jupyter.org
```

## Programs

This package provides the following executable programs:

- `jlpm`
- `jupyter`
- `jupyter-bundlerextension`
- `jupyter-dejavu`
- `jupyter-events`
- `jupyter-execute`
- `jupyter-fileid`
- `jupyter-kernel`
- `jupyter-kernelspec`
- `jupyter-lab`
- `jupyter-labextension`
- `jupyter-labhub`
- `jupyter-migrate`
- `jupyter-nbclassic`
- `jupyter-nbclassic-bundlerextension`
- `jupyter-nbclassic-extension`
- `jupyter-nbclassic-serverextension`
- `jupyter-nbconvert`
- `jupyter-nbextension`
- `jupyter-run`
- `jupyter-server`
- `jupyter-serverextension`
- `jupyter-troubleshoot`
- `jupyter-trust`

## Available Versions

<details>
<summary>Show all 60 versions</summary>

- `4.5.2`, `4.5.1`, `4.5.0`, `4.4.10`, `4.4.9`
- `4.4.8`, `4.4.7`, `4.4.6`, `4.4.5`, `4.4.4`
- `4.4.3`, `4.4.2`, `4.4.1`, `4.4.0`, `4.3.8`
- `4.3.7`, `4.3.6`, `4.3.5`, `4.3.4`, `4.3.3`
- `4.3.2`, `4.3.1`, `4.3.0`, `4.2.7`, `4.2.6`
- `4.2.5`, `4.2.4`, `4.2.3`, `4.2.2`, `4.2.1`
- `4.2.0`, `4.1.8`, `4.1.7`, `4.1.6`, `4.1.5`
- `4.1.4`, `4.1.3`, `4.1.2`, `4.1.1`, `4.1.0`
- `4.0.13`, `4.0.12`, `4.0.11`, `4.0.10`, `4.0.9`
- `4.0.8`, `4.0.7`, `4.0.6`, `4.0.5`, `4.0.4`
- `4.0.3`, `4.0.2`, `4.0.1`, `4.0.0`, `3.6.8`
- `3.6.7`, `3.6.6`, `3.6.5`, `3.6.4`, `3.6.3`

</details>

**Latest Version**: `4.5.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +jupyter.org@4.5.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.7<3.12`
- `gnu.org/which@2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.jupyter

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/jupyter.org/package.yml)
- [Homepage](https://jupyterlab.readthedocs.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
