# Maintenance and Troubleshooting Guide

This guide provides information on maintaining your ts-pkgx environment, focusing on package variable naming conventions, cleaning up your codebase, and troubleshooting common issues.

## Package Variable Naming Conventions

ts-pkgx follows specific naming conventions for package variables to ensure compatibility with JavaScript/TypeScript requirements and maintain consistency across the codebase.

### Naming Rules

1. **Domain Names**: Primary package identifiers derived from domain names with dots removed
   - Example: `bun.sh` → `bunshPackage`
   - Example: `python.org` → `pythonorgPackage`

2. **Nested Paths**: For packages with subpaths, the slash is removed and parts are concatenated
   - Example: `agwa.name/git-crypt` → `agwanamegitcryptPackage`
   - Example: `aws.amazon.com/cli` → `awsamazoncomcliPackage`

3. **Hyphenated Names**: Hyphens are invalid in JavaScript/TypeScript variable names and are removed
   - Example: `test-domain.com` → `testdomaincomPackage`
   - Example: `ast-grep.github.io` → `astgrepgithubioPackage`

### Filename to Variable Mapping

The file system uses slightly different conventions to help with readability:

1. **Standard Domains**: Dots are removed from filenames
   - Example: `bun.sh` → `bunsh.ts`

2. **Nested Paths**: Slashes are replaced with hyphens in filenames
   - Example: `agwa.name/git-crypt` → `agwaname-gitcrypt.ts`

The system automatically handles conversion between these formats.

## Cleaning Up Package Variables

When working with ts-pkgx packages, you might encounter situations where package variable names don't follow the required conventions, particularly when packages have hyphens in their names. The `cleanup` command helps to fix these issues automatically.

### When to Run Cleanup

You should run the cleanup command when:

1. You've manually added package files with variable names containing hyphens
2. You've generated packages from domains with complex paths
3. You encounter TypeScript errors related to invalid variable names
4. After updating packages from external sources
5. Before publishing or distributing your package

### Running the Cleanup Command

```bash
# Using npm/bun scripts
bun run pkgx:cleanup

# Using CLI directly
bun bin/cli.ts cleanup
```

### What the Cleanup Process Does

The cleanup process performs the following actions:

1. **Scan Package Files**: Examines all `.ts` files in the `src/packages` directory
2. **Identify Invalid Names**: Finds exported variables and interfaces with hyphens
3. **Fix Variable Names**: Replaces hyphenated names with proper concatenated names
4. **Update References**: Updates any references to the variables within the files
5. **Regenerate Index**: Rebuilds the index.ts file to ensure all exports are correct

## Regenerating the Index File

The index file (`src/packages/index.ts`) needs to be kept in sync with the package files. The system will automatically regenerate this file when:

1. You run the `cleanup` command
2. You run the `update:packages` command
3. You fetch new packages with `fetch` or `fetch-all`

You can also manually regenerate the index file with:

```bash
bun run generate:index
```

## Troubleshooting Common Issues

### Invalid Variable Names

**Problem**: You encounter TypeScript errors like `"SyntaxError: Invalid or unexpected token"` or `"Error: Invalid variable name"`

**Solution**: Run the `cleanup` command to fix all variable names across your packages:

```bash
bun run pkgx:cleanup
```

### Missing Package Exports

**Problem**: You've added packages but they're not accessible when importing from the library

**Solution**: Regenerate the index file:

```bash
bun run generate:index
```

### Failed Package Fetches

**Problem**: Some packages fail to fetch when running the `fetch-all` command

**Solution**: Try the following:

1. Increase the timeout:
   ```bash
   bun run pkgx:fetch-all --timeout 60000
   ```

2. Try a different fetch mode:
   ```bash
   bun run pkgx:fetch-all --mode scrape
   ```

3. Fetch problematic packages individually:
   ```bash
   bun run pkgx:fetch <package-name> --retries 5
   ```

### GitHub API Rate Limits

**Problem**: You encounter GitHub API rate limit errors

**Solution**: Use cached data or wait for the rate limit to reset:

1. Set a longer cache duration:
   ```bash
   bun run pkgx:fetch-all --cache-duration 240
   ```

2. If you have a GitHub token, you can set it as an environment variable:
   ```bash
   export GITHUB_TOKEN=your_github_token
   ```

## Best Practices

1. **Regular Maintenance**: Run the cleanup command periodically
2. **Custom Packages**: Follow the naming conventions when creating custom packages
3. **Testing**: After cleanup, ensure all tests pass to verify package functionality
4. **Documentation**: Keep documentation up-to-date when adding new packages

By following these guidelines and using the maintenance tools provided, you can ensure your ts-pkgx codebase remains clean, consistent, and error-free.
