# Package Maintenance and Troubleshooting

Maintaining a large collection of package definitions can sometimes lead to issues with variable naming, file organization, and TypeScript compatibility. This guide covers common maintenance tasks and troubleshooting steps for the ts-pkgx library.

## Common Issues and Solutions

### Variable Naming Issues

TypeScript variable names must be valid JavaScript identifiers. This means they cannot contain:

- Hyphens (e.g., `package-name`)
- Periods (e.g., `package.name`)
- Special characters
- Names that start with numbers

When package domain names contain these characters, ts-pkgx automatically converts them to valid identifiers. For example:

| Domain Name | Variable Name |
|-------------|--------------|
| `nodejs.org` | `nodejsorgPackage` |
| `agwa.name/git-crypt` | `agwanamegitcryptPackage` |
| `apple.com/remote_cmds` | `applecomremotecmdsPackage` |

### Using the Cleanup Command

If you encounter variable naming issues or need to regenerate the index file, use the cleanup command:

```bash
# Run the cleanup process
bun run pkgx:cleanup

# Using the CLI directly
bun bin/cli.ts cleanup
```

The cleanup command:

1. Scans all package files for variable names with hyphens or other invalid characters
2. Fixes these names to be valid JavaScript identifiers
3. Regenerates the index.ts file with the corrected names

This is especially useful after fetching new packages or when encountering TypeScript compilation errors.

## Behind the Scenes

### How Variable Names Are Generated

The package variable names are generated using these rules:

1. Remove all dots (e.g., `nodejs.org` → `nodejsorg`)
2. Remove all hyphens (e.g., `git-crypt` → `gitcrypt`)
3. For nested paths:
   - Split the domain and subpath
   - Clean both parts separately
   - Join them without separators (e.g., `agwa.name/git-crypt` → `agwanamegitcrypt`)
4. Add "Package" suffix (e.g., `nodejsorg` → `nodejsorgPackage`)

This transformation is handled by the `convertDomainToVarName` function in `src/tools/domainUtils.ts`.

### File Naming Conventions

Package file names use a similar but slightly different convention:

1. For regular domains, dots are removed (e.g., `nodejs.org` → `nodejsorg.ts`)
2. For nested paths, a hyphen is used between domain and subpath for readability (e.g., `agwa.name/git-crypt` → `agwaname-gitcrypt.ts`)

This helps maintain a clean file structure while keeping files associated with their domains.

## Maintenance Tasks

### Regenerating the Index File

The index file (`src/packages/index.ts`) exports all package variables for easy access. You can regenerate it using:

```bash
bun run generate:index
```

### Fixing a Specific Package

If you need to fix a specific package file manually:

1. Edit the file to correct variable names
2. Remove any duplicate interface definitions
3. Run the cleanup command to ensure consistency

### Large-Scale Package Updates

When updating many packages at once, use batch processing to avoid memory issues:

```bash
# Update all packages with optimized batching
bun run pkgx:update
```

## Debugging Package Issues

If you encounter issues with specific packages:

### Enable Debug Mode

Use the debug flag to get more detailed information:

```bash
bun run pkgx:fetch nodejs.org --debug
```

This creates detailed logs in the `debug` directory that can help diagnose fetch issues.

### Check for Duplicates

Sometimes duplicate package definitions can cause conflicts. To check for duplicates:

```bash
# List all package files
ls src/packages | sort > packages.txt

# Find duplicate package entries in index.ts
grep "export \* from" src/packages/index.ts | sort > exports.txt

# Compare the two lists
diff packages.txt exports.txt
```

## Best Practices

1. **Regular Maintenance**: Run the cleanup command periodically, especially after fetching new packages
2. **Check TypeScript Compatibility**: Run `bun run typecheck` to ensure all package definitions compile correctly
3. **Review Generated Names**: For packages with complex domains, verify that the generated variable names make sense
4. **Update Index**: Always regenerate the index file after adding or removing package files
5. **Use Batch Processing**: For large operations, use batch processing to avoid memory issues

By following these maintenance practices, you can keep your ts-pkgx installation running smoothly and avoid common issues.
