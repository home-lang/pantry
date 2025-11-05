# ts-pantry

TypeScript types for Pantry package manager configuration with **full type validation** for package names and versions.

## Installation

```bash
bun add -d ts-pantry ts-pkgx
```

## Usage

```typescript
import type { PantryConfig } from 'ts-pantry'

export const config: PantryConfig = {
  dependencies: {
    'bun.com': '^1.3.0',      // ✅ Valid
    'sqlite.org': '^3.47.2',  // ✅ Valid
    // 'bun.com': '^999.999.999',  // ❌ TypeScript error: invalid version!
    // 'fake-pkg': 'latest',      // ❌ TypeScript error: package doesn't exist!
  },

  services: {
    enabled: true,
    autoStart: true,
    database: {
      connection: 'sqlite',
      name: 'myapp',
    },
  },

  verbose: true,
}

export default config
```

## Features

- **Full Type Validation**: Package names and versions are validated at compile time
- **IntelliSense Support**: Get autocomplete for all 3000+ packages from the pkgx registry
- **Version Validation**: Invalid versions trigger TypeScript errors
- **Zero Configuration**: Just import and use - no additional setup required

## Type Definitions

### `PantryConfig`

Main configuration interface for Pantry with all available options.

### `Dependencies`

Type-safe dependency specification with version constraints.

### Helper Functions

- `definePantryConfig(config)` - Helper to define configuration with full type safety
- `defineDependencies(deps)` - Helper to define dependencies with type checking
- `definePackageList(packages)` - Helper to define package arrays

## License

MIT
