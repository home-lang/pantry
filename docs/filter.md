# pantry --filter

> Select packages by pattern in a workspace using the --filter flag

The `--filter` (or `-F`) flag is used for selecting packages by pattern in a workspace. Patterns can be used to match package names or package paths, with full glob syntax support.

Currently `--filter` is supported by `pantry install` and `pantry run`, and can also be used to run scripts for multiple packages at once.

---

## Matching

### Package Name `--filter <pattern>`

Name patterns select packages based on the package name, as specified in `pantry.json` or `package.json`. For example, if you have packages `pkg-a`, `pkg-b` and `other`, you can match all packages with `*`, only `pkg-a` and `pkg-b` with `pkg*`, and a specific package by providing the full name of the package.

**Examples:**
```bash
# Match all packages starting with "pkg-"
pantry install --filter 'pkg-*'

# Match a specific package
pantry install --filter 'pkg-a'

# Match packages with wildcard in middle
pantry install --filter '@myorg/*'
```

### Package Path `--filter ./<glob>`

Path patterns are specified by starting the pattern with `./`, and will select all packages in directories that match the pattern. For example, to match all packages in subdirectories of `packages`, you can use `--filter './packages/**'`. To match a package located in `packages/foo`, use `--filter ./packages/foo`.

**Examples:**
```bash
# Match all packages in packages/ directory
pantry install --filter './packages/*'

# Match a specific package by path
pantry install --filter './packages/foo'

# Match packages in multiple levels
pantry install --filter './apps/**'
```

### Negation `--filter !<pattern>`

You can exclude packages by prefixing the pattern with `!`. Negations are processed after inclusions, so if a package matches both an inclusion and exclusion pattern, it will be excluded.

**Examples:**
```bash
# Install all packages except pkg-c
pantry install --filter '*' --filter '!pkg-c'

# Install all packages in packages/ except one
pantry install --filter './packages/*' --filter '!./packages/excluded'
```

### Root Package `--filter ./`

The special pattern `./` matches the root package (the workspace root's `pantry.json` or `package.json`).

**Examples:**
```bash
# Install only the root package dependencies
pantry install --filter './'

# Install all packages except the root
pantry install --filter '*' --filter '!./'
```

---

## `pantry install --filter`

`pantry install` by default will install dependencies for all packages in the workspace. To install dependencies for specific packages, use `--filter`.

Given a workspace with packages `pkg-a`, `pkg-b`, and `pkg-c` under `./packages`:

```bash
# Install dependencies for all workspace packages except `pkg-c`
pantry install --filter 'pkg-*' --filter '!pkg-c'

# Install dependencies for packages in `./packages` (pkg-a`, `pkg-b`, `pkg-c`)
pantry install --filter './packages/*'

# Same as above, but exclude the root package.json
pantry install --filter '!./' --filter './packages/*'

# Install dependencies for a single package
pantry install --filter 'pkg-a'
```

### Multiple Filters

You can specify multiple `--filter` flags, and packages matching any of the patterns will be included (unless explicitly excluded with `!`).

```bash
# Install dependencies for pkg-a, pkg-b, and all packages in apps/
pantry install --filter 'pkg-a' --filter 'pkg-b' --filter './apps/*'
```

---

## Running scripts with `--filter`

Use the `--filter` flag to execute scripts in multiple packages at once:

```bash
pantry run <script> --filter <pattern>
```

Say you have a workspace with two packages: `packages/api` and `packages/frontend`, both with a `dev` script that will start a local development server. Normally, you would have to open two separate terminal tabs, cd into each package directory, and run `pantry run dev`:

```bash
cd packages/api
pantry run dev

# in another terminal
cd packages/frontend
pantry run dev
```

Using `--filter`, you can run the `dev` script in both packages at once:

```bash
pantry run dev --filter '*'
```

The script will execute in each matching package, and you'll see output showing the status for each:

```
Running script 'dev' in 2 package(s):
  • api
  • frontend

→ api
✓ api
→ frontend
✓ frontend

✓ 2 succeeded
```

### Running scripts in workspaces

Filters respect your workspace configuration: If you have a `pantry.json` file that specifies which packages are part of the workspace, `--filter` will be restricted to only these packages. Also, in a workspace you can use `--filter` to run scripts in packages that are located anywhere in the workspace:

```bash
# Packages structure:
# src/foo
# src/bar

# In src/bar: runs myscript in src/foo, no need to cd!
pantry run myscript --filter 'foo'
```

### Script Output

When running scripts with `--filter`, pantry will:

1. Show which packages the script will run in
2. Execute the script in each matching package
3. Display a symbol indicating success (✓), failure (✗), or skipped (⊘)
4. Show a summary of succeeded, failed, and skipped packages

**Example output:**
```
Running script 'build' in 3 package(s):
  • pkg-a
  • pkg-b
  • pkg-c

→ pkg-a
✓ pkg-a
→ pkg-b
✗ pkg-b (exit code: 1)
→ pkg-c
⊘ pkg-c (script not found)

✓ 1 succeeded, 1 failed, 1 skipped
```

### Dependency Order

Pantry automatically analyzes dependencies between workspace members and executes scripts in the correct order. This ensures that if package `B` depends on package `A`, then `A`'s scripts will run before `B`'s scripts.

**How it works:**

1. **Automatic Detection**: Pantry reads each workspace member's `package.json` or `pantry.json` to find dependencies on other workspace members
2. **Topological Sort**: Uses topological sorting to determine the correct execution order
3. **Parallel Groups**: Identifies packages that can run in parallel (no dependencies on each other)
4. **Sequential Execution**: Currently executes in dependency order sequentially (parallel execution coming soon)

**Example:**

Given a workspace with:
- `shared-utils` (no dependencies)
- `api` (depends on `shared-utils`)
- `frontend` (depends on `shared-utils`)
- `e2e-tests` (depends on `api` and `frontend`)

Running `pantry run build --filter '*'` will execute in this order:
1. `shared-utils` (first, no dependencies)
2. `api` and `frontend` (can run in parallel, both depend only on `shared-utils`)
3. `e2e-tests` (last, depends on everything else)

**Circular Dependencies:**

If Pantry detects circular dependencies (A depends on B, B depends on A), it will report an error:

```
Error: Circular dependency detected in workspace
```

To fix this, review your dependencies and break the circular reference.

---

## Pattern Syntax

Pantry's filter patterns support the following glob syntax:

- `*` - Matches any sequence of characters
- `?` - Matches any single character
- `!` prefix - Excludes packages matching the pattern
- `./` prefix - Matches by path instead of name
- `./` alone - Matches the root package

**Pattern Examples:**

| Pattern | Matches |
|---------|---------|
| `pkg-*` | `pkg-a`, `pkg-b`, `pkg-foo` |
| `*-test` | `unit-test`, `integration-test` |
| `@org/*` | `@org/package-a`, `@org/package-b` |
| `!pkg-c` | Excludes `pkg-c` |
| `./packages/*` | All packages in `packages/` directory |
| `./apps/**` | All packages in `apps/` and subdirectories |
| `./` | The root package only |

---

## Common Use Cases

### Installing specific workspace packages

```bash
# Install dependencies for frontend packages only
pantry install --filter './packages/frontend-*'

# Install dependencies for one specific package
pantry install --filter 'my-package'
```

### Running build scripts

```bash
# Build all packages
pantry run build --filter '*'

# Build only backend packages
pantry run build --filter './packages/backend-*'

# Build everything except tests
pantry run build --filter '*' --filter '!*-test'
```

### Running tests

```bash
# Test all packages
pantry run test --filter '*'

# Test only packages that changed (you'd determine this separately)
pantry run test --filter 'pkg-a' --filter 'pkg-b'

# Test all except integration tests
pantry run test --filter '*' --filter '!integration-*'
```

### Development workflow

```bash
# Start dev servers for frontend and API
pantry run dev --filter 'frontend' --filter 'api'

# Start dev servers for all packages in packages/
pantry run dev --filter './packages/*'
```

---

## Differences from other package managers

### Compared to bun --filter

Pantry's `--filter` implementation is inspired by Bun's, with similar syntax and behavior:

- ✅ Name patterns (`pkg-*`)
- ✅ Path patterns (`./packages/*`)
- ✅ Negation (`!pattern`)
- ✅ Root matching (`./`)
- ✅ Multiple filters
- ✅ Script execution across packages
- ⚠️ Dependency ordering (planned, not yet implemented)

### Compared to npm/pnpm workspaces

npm and pnpm use `--workspace` or `-w` flags with slightly different syntax:

```bash
# npm/pnpm
npm run test --workspace=pkg-a

# pantry
pantry run test --filter 'pkg-a'
```

Pantry's approach is more flexible with glob patterns and negation support.

---

## Tips and Best Practices

### 1. Use quotes for patterns with wildcards

Always quote patterns that contain wildcards to prevent shell expansion:

```bash
# Good
pantry install --filter '*'
pantry install --filter 'pkg-*'

# Bad (shell will expand * before pantry sees it)
pantry install --filter *
```

### 2. Combine multiple filters for complex selections

```bash
# Install for frontend and backend, but not tests
pantry install --filter 'frontend-*' --filter 'backend-*' --filter '!*-test'
```

### 3. Use path patterns for structural organization

```bash
# Install all packages in a specific directory
pantry install --filter './services/*'

# More specific than name patterns
pantry install --filter './packages/core/*'
```

### 4. Test your filter patterns first

Use `pantry install --filter <pattern>` with a dry run or verbose mode to see which packages match before running expensive operations:

```bash
# See which packages would be affected
pantry install --filter 'pkg-*'
# (observe the output to verify correct packages are selected)
```

---

## Troubleshooting

### Filter matches no packages

If your filter doesn't match any packages, pantry will show an error:

```
Error: No workspace members match the filter pattern
```

**Solutions:**
- Verify your pattern syntax
- Check that you're in a workspace directory
- List all workspace members to see available packages
- Try a broader pattern first (like `'*'`) to see all packages

### Script not found in some packages

When running scripts with `--filter`, some packages might not have the script defined:

```
⊘ pkg-a (script not found)
```

This is normal and expected. Pantry will skip packages that don't have the requested script.

### Wrong packages selected

If the wrong packages are being selected:
- Remember that name patterns match against the package name (from `pantry.json`/`package.json`), not the directory name
- Use path patterns (`./packages/foo`) if you want to match by directory structure
- Check for accidental shell expansion - always quote your patterns

---

## Advanced Features

### Parallel Execution

Pantry can run scripts in parallel across multiple packages, significantly speeding up builds and tests:

```bash
# Run in parallel (default)
pantry run build --filter '*'

# Run sequentially
pantry run build --filter '*' --sequential

# Explicitly enable parallel
pantry run build --filter '*' --parallel
```

**How it works:**
- Packages are grouped by dependency level
- Each group runs in parallel using threads
- Dependencies are respected (level 0 before level 1)
- Shows timing information for each package

**Example output:**
```
Running script 'build' in 4 package(s) (3 parallel groups):
  • shared-utils
  • api
  • frontend
  • e2e-tests

Group 1 (1 package(s))
✓ shared-utils (234ms)
Group 2 (2 package(s))
✓ api (456ms)
✓ frontend (512ms)
Group 3 (1 package(s))
✓ e2e-tests (1234ms)

✓ 4 succeeded
```

### Changed Packages Detection

Only run scripts on packages that have changed since a git ref:

```bash
# Run on packages changed since HEAD
pantry run test --changed HEAD

# Run on packages changed since main branch
pantry run build --changed origin/main

# Combine with filter
pantry run test --filter 'pkg-*' --changed HEAD
```

**Detection strategy:**
- Uses `git diff` to find changed files
- Includes uncommitted changes
- Maps changed files to workspace packages
- Respects dependency order

**Example output:**
```
Detected 2 changed package(s) since HEAD

Running script 'test' in 2 package(s):
  • api
  • e2e-tests

✓ api
✓ e2e-tests

✓ 2 succeeded
```

**Use cases:**
- CI/CD: Only test what changed
- Incremental builds: Rebuild only affected packages
- Fast iteration: Skip unchanged packages

## Future Enhancements

Planned improvements for `--filter`:

1. ✅ **Dependency-aware ordering**: Automatically run scripts in dependency order (IMPLEMENTED)
2. ✅ **Parallel execution**: Run scripts in parallel where possible (IMPLEMENTED)
3. ✅ **Changed packages detection**: Only select packages with changes (IMPLEMENTED)
4. **Filter configuration**: Save common filter patterns in `pantry.json`
5. **Advanced glob patterns**: Support for `**`, `{a,b}`, and other advanced glob features
6. **Watch mode**: `--watch` to re-run scripts when files change in filtered packages

---

## Examples Repository

For more examples and real-world usage patterns, see the [pantry examples repository](https://github.com/pantry/examples) (coming soon).
