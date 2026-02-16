# Catalogs

> Share common dependency versions across multiple packages in a monorepo

Catalogs in Pantry provide a straightforward way to share common dependency versions across multiple packages in a monorepo. Rather than specifying the same versions repeatedly in each workspace package, you define them once in the root package.json and reference them consistently throughout your project.

## Overview

Unlike traditional dependency management where each workspace package needs to independently specify versions, catalogs let you:

1. Define version catalogs in the root package.json
2. Reference these versions with a simple `catalog:` protocol
3. Update all packages simultaneously by changing the version in just one place

This is especially useful in large monorepos where dozens of packages need to use the same version of key dependencies.

## How to Use Catalogs

### Directory Structure Example

Consider a monorepo with the following structure:

```
my-monorepo/
├── package.json
├── pantry.lock
└── packages/
    ├── app/
    │   └── package.json
    ├── ui/
    │   └── package.json
    └── utils/
        └── package.json
```

### 1. Define Catalogs in Root package.json

In your root-level `package.json`, add a `catalog` or `catalogs` field within the `workspaces` object:

```json
{
    "name": "my-monorepo",
    "workspaces": {
        "packages": ["packages/*"],
        "catalog": {
            "react": "^19.0.0",
            "react-dom": "^19.0.0"
        },
        "catalogs": {
            "testing": {
                "jest": "30.0.0",
                "testing-library": "14.0.0"
            }
        }
    }
}
```

If you put `catalog` or `catalogs` at the top level of the `package.json` file, that will work too.

### 2. Reference Catalog Versions in Workspace Packages

In your workspace packages, use the `catalog:` protocol to reference versions:

```json
// packages/app/package.json
{
    "name": "app",
    "dependencies": {
        "react": "catalog:",
        "react-dom": "catalog:",
        "jest": "catalog:testing"
    }
}
```

```json
// packages/ui/package.json
{
    "name": "ui",
    "dependencies": {
        "react": "catalog:",
        "react-dom": "catalog:"
    },
    "devDependencies": {
        "jest": "catalog:testing",
        "testing-library": "catalog:testing"
    }
}
```

### 3. Run Pantry Install

Run `pantry install` to install all dependencies according to the catalog versions.

## Catalog vs Catalogs

Pantry supports two ways to define catalogs:

### 1. `catalog` (singular): A single default catalog for commonly used dependencies

```json
{
    "catalog": {
        "react": "^19.0.0",
        "react-dom": "^19.0.0"
    }
}
```

Reference with simply `catalog:`:

```json
{
    "dependencies": {
        "react": "catalog:"
    }
}
```

### 2. `catalogs` (plural): Multiple named catalogs for grouping dependencies

```json
{
    "catalogs": {
        "testing": {
            "jest": "30.0.0"
        },
        "ui": {
            "tailwind": "4.0.0"
        }
    }
}
```

Reference with `catalog:<name>`:

```json
{
    "dependencies": {
        "jest": "catalog:testing",
        "tailwind": "catalog:ui"
    }
}
```

## Benefits of Using Catalogs

* **Consistency**: Ensures all packages use the same version of critical dependencies
* **Maintenance**: Update a dependency version in one place instead of across multiple package.json files
* **Clarity**: Makes it obvious which dependencies are standardized across your monorepo
* **Simplicity**: No need for complex version resolution strategies or external tools
* **Type Safety**: Pantry warns you if a catalog reference can't be resolved

## Real-World Example

Here's a comprehensive example for a React application:

### Root package.json

```json
{
    "name": "react-monorepo",
    "workspaces": {
        "packages": ["packages/*"],
        "catalog": {
            "react": "^19.0.0",
            "react-dom": "^19.0.0",
            "react-router-dom": "^6.15.0"
        },
        "catalogs": {
            "build": {
                "webpack": "5.88.2",
                "babel": "7.22.10"
            },
            "testing": {
                "jest": "29.6.2",
                "react-testing-library": "14.0.0"
            }
        }
    },
    "devDependencies": {
        "typescript": "5.1.6"
    }
}
```

### packages/app/package.json

```json
{
    "name": "app",
    "dependencies": {
        "react": "catalog:",
        "react-dom": "catalog:",
        "react-router-dom": "catalog:",
        "@monorepo/ui": "workspace:*",
        "@monorepo/utils": "workspace:*"
    },
    "devDependencies": {
        "webpack": "catalog:build",
        "babel": "catalog:build",
        "jest": "catalog:testing",
        "react-testing-library": "catalog:testing"
    }
}
```

### packages/ui/package.json

```json
{
    "name": "@monorepo/ui",
    "dependencies": {
        "react": "catalog:",
        "react-dom": "catalog:"
    },
    "devDependencies": {
        "jest": "catalog:testing",
        "react-testing-library": "catalog:testing"
    }
}
```

### packages/utils/package.json

```json
{
    "name": "@monorepo/utils",
    "dependencies": {
        "react": "catalog:"
    },
    "devDependencies": {
        "jest": "catalog:testing"
    }
}
```

## Updating Versions

To update versions across all packages, simply change the version in the root package.json:

```json
{
    "catalog": {
        "react": "^19.1.0",  // Updated from ^19.0.0
        "react-dom": "^19.1.0"  // Updated from ^19.0.0
    }
}
```

Then run `pantry install` to update all packages.

## Catalog Locations

Pantry looks for catalogs in two places (in order of precedence):

1. **Inside workspaces object** (recommended):

   ```json
   {
       "workspaces": {
           "catalog": { ... },
           "catalogs": { ... }
       }
   }
   ```

2. **Top level** (also supported):

   ```json
   {
       "catalog": { ... },
       "catalogs": { ... }
   }
   ```

If both locations are present, Pantry prefers the workspaces location for the default catalog, but merges named catalogs from both locations.

## Installation Process

When you run `pantry install` in a workspace:

1. **Load Catalogs**: Pantry reads the root `package.json` and loads all catalog definitions
2. **Discover Members**: Finds all workspace members based on the `workspaces.packages` patterns
3. **Resolve References**: For each workspace member:
   * Reads the member's `package.json`
   * Finds dependencies with `catalog:` references
   * Resolves them using the appropriate catalog
   * Warns if a catalog reference can't be resolved
4. **Install**: Installs the resolved dependencies

### Example Output

```bash
$ pantry install

📚 Found 3 catalog(s)
🔍 Workspace: react-monorepo
   Found 3 workspace member(s)

📦 app
   └─ 7 dependencies
📦 ui
   └─ 4 dependencies
📦 utils
   └─ 2 dependencies

➤ Installing 8 unique package(s)...
✓ react@19.0.0
✓ react-dom@19.0.0
✓ jest@29.6.2
...

✓ Installed 8 package(s) in 2.3s
```

## Error Handling

### Missing Catalog Reference

If a package references a catalog that doesn't exist:

```bash
Warning: Package 'unknown-package' references default catalog but no version found
```

The dependency will be skipped and installation will continue with other packages.

### Missing Named Catalog

If a package references a named catalog that doesn't exist:

```bash
Warning: Package 'webpack' references catalog 'build' but no version found
```

### Invalid Version in Catalog

If a catalog contains an invalid version specification:

```bash
Warning: Invalid version 'not-a-version' for package 'foo' in catalog, skipping
```

The package will be skipped when parsing the catalog.

## Limitations and Edge Cases

* **Workspace Only**: Catalog references only work within workspaces; they cannot be used outside a monorepo
* **Empty Strings**: Empty strings and whitespace in catalog names are treated as the default catalog
* **Resolution Order**: If a package appears in multiple catalogs, the first one found is used
* **No Nested Catalogs**: You cannot nest catalog definitions within each other
* **Version Must Exist**: The package name in the catalog must have a corresponding version defined

## Advanced Usage

### Combining Catalogs with Overrides

You can use catalogs together with overrides for fine-grained control:

```json
{
    "workspaces": {
        "catalog": {
            "react": "^19.0.0"
        }
    },
    "overrides": {
        "transitive-dep": "~2.0.0"
    }
}
```

Catalogs are resolved first, then overrides are applied to the resolved versions.

### Grouping by Purpose

Use named catalogs to group dependencies by purpose:

```json
{
    "catalogs": {
        "frontend": {
            "react": "^19.0.0",
            "vue": "^3.0.0"
        },
        "backend": {
            "express": "^4.18.0",
            "fastify": "^4.0.0"
        },
        "testing": {
            "jest": "^29.0.0",
            "vitest": "^1.0.0"
        },
        "tooling": {
            "typescript": "^5.0.0",
            "eslint": "^8.0.0"
        }
    }
}
```

### Workspace Protocol

Catalogs work seamlessly with the `workspace:` protocol:

```json
{
    "catalog": {
        "ui-lib": "workspace:*",
        "utils-lib": "workspace:*"
    }
}
```

Then in workspace members:

```json
{
    "dependencies": {
        "ui-lib": "catalog:",
        "utils-lib": "catalog:"
    }
}
```

## Comparison with Other Tools

| Feature | Pantry | Bun | pnpm | Yarn |
|---------|--------|-----|------|------|
| Single catalog | ✅ | ✅ | ❌ | ❌ |
| Named catalogs | ✅ | ✅ | ❌ | ❌ |
| Top-level catalogs | ✅ | ✅ | N/A | N/A |
| Workspaces.catalog | ✅ | ✅ | N/A | N/A |
| Warning on missing | ✅ | ✅ | N/A | N/A |
| Version validation | ✅ | ✅ | N/A | N/A |

## Best Practices

### 1. Use Descriptive Catalog Names

```json
{
    "catalogs": {
        "testing": { ... },        // Good: clear purpose
        "prod-deps": { ... },      // Good: clear scope
        "misc": { ... }            // Bad: unclear grouping
    }
}
```

### 2. Keep the Default Catalog Small

Put only the most common, critical dependencies in the default catalog:

```json
{
    "catalog": {
        // Only truly shared core dependencies
        "react": "^19.0.0",
        "typescript": "^5.0.0"
    },
    "catalogs": {
        // Everything else in named catalogs
        "testing": { ... },
        "build": { ... }
    }
}
```

### 3. Document Your Catalogs

Add comments explaining the purpose of each catalog:

```json
{
    "catalogs": {
        // Core UI framework versions
        "ui": {
            "react": "^19.0.0"
        },
        // Testing infrastructure
        "testing": {
            "jest": "^29.0.0"
        }
    }
}
```

### 4. Version Range Consistency

Use consistent version range strategies within each catalog:

```json
{
    "catalog": {
        // All using caret ranges for patch/minor updates
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "react-router": "^6.15.0"
    }
}
```

### 5. Regular Updates

Periodically review and update your catalog versions:

```bash
# Check for outdated packages
pantry outdated

# Update catalog versions in root package.json
# Then reinstall
pantry install
```

## Troubleshooting

### Problem: Catalog reference not resolving

**Solution**: Check that:

1. The root package.json has the catalog defined
2. The package name in the catalog matches exactly
3. You're running `pantry install` from the workspace root

### Problem: Wrong version being installed

**Solution**:

1. Check if there are multiple catalog definitions (workspaces vs top-level)
2. Verify the catalog name in the reference matches the catalog definition
3. Clear the lockfile and reinstall: `rm pantry.lock && pantry install`

### Problem: Catalog not found warning

**Solution**:

```bash
# Check your root package.json structure
cat package.json | grep -A 10 "catalog"

# Ensure the catalog is in the right location
# Either workspaces.catalog or top-level catalog
```

## Examples from Real Projects

### Turborepo-style Monorepo

```json
{
    "name": "turborepo-example",
    "workspaces": {
        "packages": ["apps/*", "packages/*"],
        "catalog": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "typescript": "^5.0.0"
        },
        "catalogs": {
            "turbo": {
                "turbo": "^1.10.0",
                "eslint-config-turbo": "^1.10.0"
            }
        }
    }
}
```

### Full-stack TypeScript Monorepo

```json
{
    "name": "fullstack-mono",
    "workspaces": {
        "packages": ["packages/*"],
        "catalog": {
            "typescript": "~5.2.0"
        },
        "catalogs": {
            "frontend": {
                "react": "^18.2.0",
                "next": "^14.0.0"
            },
            "backend": {
                "express": "^4.18.2",
                "prisma": "^5.0.0"
            },
            "shared": {
                "zod": "^3.22.0",
                "date-fns": "^2.30.0"
            }
        }
    }
}
```

## See Also

* [Workspaces](./workspaces.md) - Learn about monorepo workspaces
* [Dependencies](./dependencies.md) - Dependency management basics
* [Overrides](./overrides-resolutions.md) - Control metadependency versions
* [pantry install](./commands/install.md) - Install command reference
