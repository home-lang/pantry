# MeetingBar

> A menu bar app for your calendar meetings.

## Package Information

- **Domain**: `meetingbar.app`
- **Name**: `MeetingBar`
- **Homepage**: <https://meetingbar.app>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/meetingbar.app/package.yml)

## Installation

```bash
# Install with pantry
pantry install meetingbar.app
```

## Programs

This package provides the following executable programs:

- `meetingbar`

## Aliases

This package can also be accessed using these aliases:

- `meetingbar`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `4.10.0`
- `4.9.0`

</details>

**Latest Version**: `4.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +meetingbar.app@4.10.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.meetingbar

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/meetingbar.app/package.yml)
- [Homepage](https://meetingbar.app)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
