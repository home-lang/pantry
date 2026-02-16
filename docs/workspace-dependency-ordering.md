# Workspace Dependency Ordering

Pantry automatically analyzes and respects dependencies between workspace members when executing scripts, ensuring that packages are processed in the correct order.

## Overview

When you run scripts across multiple workspace packages using `--filter`, Pantry:

1. **Analyzes Dependencies**: Reads `package.json` or `pantry.json` from each workspace member
2. **Builds Dependency Graph**: Creates a graph of which packages depend on which
3. **Topological Sort**: Orders packages so dependencies are processed before dependents
4. **Parallel Groups**: Identifies packages that can run in parallel (future feature)
5. **Sequential Execution**: Runs scripts in the correct order

## How It Works

### Dependency Detection

Pantry looks at three dependency fields in each workspace member's configuration:

- `dependencies`
- `devDependencies`
- `peerDependencies`

If a package lists another workspace member as a dependency, Pantry recognizes this relationship.

**Example `package.json`:**

```json
{
  "name": "api",
  "version": "1.0.0",
  "dependencies": {
    "shared-utils": "workspace:*"  // Points to another workspace member
  }
}
```

### Topological Sorting

Pantry uses [Kahn's algorithm](https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm) to sort packages:

1. Find all packages with no dependencies (in-degree = 0)
2. Process these packages first
3. Remove them from the graph and update in-degrees
4. Repeat until all packages are processed

This ensures dependencies are always processed before packages that depend on them.

### Execution Order

Given this workspace structure:

```
workspace/
├── packages/
│   ├── utils/          # No dependencies
│   ├── api/            # Depends on: utils
│   ├── frontend/       # Depends on: utils
│   └── e2e/            # Depends on: api, frontend
└── package.json
```

**Execution order for `pantry run build --filter '*'`:**

```
Level 0: utils (no dependencies)
Level 1: api, frontend (both depend only on utils)
Level 2: e2e (depends on api and frontend)
```

**Visual representation:**

```
utils
  ├── api
  └── frontend
        └── e2e
```

## Examples

### Basic Dependency Chain

**Workspace structure:**

- `shared-config` (no dependencies)
- `shared-types` (depends on `shared-config`)
- `backend` (depends on `shared-types`)
- `frontend` (depends on `shared-types`)

**Command:**

```bash
pantry run build --filter '*'
```

**Execution order:**

1. `shared-config`
2. `shared-types`
3. `backend` and `frontend` (independent of each other)

**Output:**

```
Running script 'build' in 4 package(s) (3 parallel groups):
  • shared-config
  • shared-types
  • backend
  • frontend

→ shared-config
✓ shared-config
→ shared-types
✓ shared-types
→ backend
✓ backend
→ frontend
✓ frontend

✓ 4 succeeded
```

### Diamond Dependency

**Workspace structure:**

```
    core
   /    \
  db    api
   \    /
    app
```

**Command:**

```bash
pantry run test --filter '*'
```

**Execution order:**

1. `core`
2. `db` and `api` (both depend on `core`, independent of each other)
3. `app` (depends on both `db` and `api`)

### Filtering with Dependencies

When you filter packages, Pantry only orders the **selected** packages, not the entire workspace.

**Command:**

```bash
pantry run build --filter 'api' --filter 'frontend'
```

If `frontend` depends on `api`, the order will be:

1. `api`
2. `frontend`

Even though other packages exist in the workspace, they're not included in the ordering.

## Circular Dependencies

### Detection

Pantry detects circular dependencies and reports an error:

```
Error: Circular dependency detected in workspace
```

### Common Causes

**Direct circular dependency:**

```json
// Package A
{
  "dependencies": { "package-b": "workspace:_" }
}

// Package B
{
  "dependencies": { "package-a": "workspace:_" }
}
```

**Indirect circular dependency:**

```
A → B → C → A
```

### Resolution

To fix circular dependencies:

1. **Extract shared code**: Create a new package for shared functionality

   ```
   Before: A ↔ B
   After:  A → Shared ← B
   ```

2. **Invert dependency**: Make one package depend on an interface/contract instead
3. **Merge packages**: If they're tightly coupled, consider merging them
4. **Use peer dependencies**: For optional/weak dependencies

**Example fix:**

```
Before (circular):
utils ← types ← utils

After (fixed):
core (shared interfaces)
  ├── utils (depends on core)
  └── types (depends on core)
```

## Configuration

### Disabling Dependency Ordering

Currently, dependency ordering is enabled by default. To disable it in the future:

```bash
# Future feature
pantry run build --filter '*' --no-order
```

### Dependency Resolution Strategy

Pantry uses these strategies for resolving workspace dependencies:

1. **Exact name match**: Matches `dependencies` by exact package name
2. **Workspace protocol**: Recognizes `workspace:*`, `workspace:^`, etc.
3. **Version ranges**: Ignores version constraints for workspace members

## Advanced Use Cases

### Partial Workspace Builds

Build only changed packages and their dependents:

```bash
# Build specific packages and everything that depends on them
pantry run build --filter 'shared-utils' --filter 'api' --filter 'frontend'
```

Pantry will order them correctly based on their dependencies.

### Testing Strategy

Run tests in dependency order to catch integration issues early:

```bash
# Test in dependency order
pantry run test --filter '_'
```

This ensures:

- Base packages are tested first
- Dependent packages are tested only after dependencies pass
- Fast failure if a base dependency fails

### Development Workflow

Run dev servers in the correct order:

```bash
# Start services in dependency order
pantry run dev --filter '_'
```

This is especially useful for microservices where some services depend on others being available.

## Performance Considerations

### Current Implementation

- **Sequential execution**: Packages are processed one at a time
- **Dependency order respected**: Always processes dependencies first
- **Fast for small workspaces**: Minimal overhead for analysis

### Future Improvements

1. **Parallel execution**: Run independent packages simultaneously

   ```
   Level 0: [utils] ────────────────► (done)
   Level 1: [api, frontend] ────────► (done, in parallel)
   Level 2: [e2e] ──────────────────► (done)
   ```

2. **Incremental builds**: Only rebuild changed packages
3. **Caching**: Cache script results to avoid re-running

## Troubleshooting

### "Circular dependency detected"

**Problem**: Your workspace has circular dependencies.

**Solution**:

1. Run `pantry run build --filter '*'` to see where it fails
2. Review the dependency graph
3. Refactor to remove circular references (see [Resolution](#resolution) above)

### Scripts running in wrong order

**Problem**: Scripts appear to run in the wrong order.

**Solution**:

1. Verify dependencies are correctly declared in `package.json`
2. Check that workspace members use `workspace:*` protocol
3. Ensure package names match exactly

**Example of correct declaration:**

```json
{
  "name": "frontend",
  "dependencies": {
    "api-client": "workspace:*"  // Correct: uses workspace protocol
  }
}
```

### Package not found in workspace

**Problem**: Pantry doesn't recognize a workspace dependency.

**Solution**:

1. Verify the package is listed in the root workspace configuration
2. Check the package name matches in both places
3. Ensure the package directory exists and has a valid `package.json`

## Implementation Details

### Algorithm

Pantry's dependency ordering uses:

- **Data structure**: Adjacency list representation of dependency graph
- **Algorithm**: Kahn's topological sort (in-degree based)
- **Complexity**: O(V + E) where V = packages, E = dependencies
- **Memory**: O(V + E) for graph storage

### Code Location

- **Dependency analysis**: `src/packages/workspace_deps.zig`
- **Topological sort**: `src/deps/resolver.zig`
- **Script execution**: `src/cli/commands/run_filter.zig`

### Testing

Dependency ordering is tested with:

- Simple chains (A → B → C)
- Diamond dependencies
- Independent packages
- Circular dependency detection
- Empty workspaces

Run tests with:

```bash
zig build test
```

## Comparison with Other Tools

### vs. npm/pnpm workspaces

**npm/pnpm:**

- Require `--workspace-concurrency=1` for sequential execution
- No automatic dependency ordering
- Must manually specify order with multiple commands

**Pantry:**

- Automatic dependency detection and ordering
- Built-in topological sort
- No configuration needed

### vs. Lerna

**Lerna:**

- Requires `lerna run --sort` for dependency ordering
- Can run in parallel with `--concurrency`
- Requires configuration in `lerna.json`

**Pantry:**

- Automatic by default
- No configuration required
- Simpler mental model

### vs. Turborepo

**Turborepo:**

- Explicit dependency declaration in `turbo.json`
- Parallel execution by default
- Requires setup and configuration

**Pantry:**

- Infers dependencies from `package.json`
- No additional configuration files
- Works out of the box

## Best Practices

### 1. Clear Dependency Boundaries

Make dependencies explicit and unidirectional:

```
✅ Good:
shared → api → frontend

❌ Bad (circular):
api ↔ frontend
```

### 2. Minimize Inter-Package Dependencies

Keep packages as independent as possible:

```
✅ Good:

- 3 independent packages
- 2 shared utility packages

❌ Bad:

- Everything depends on everything
- Deep dependency chains

```

### 3. Use Workspace Protocol

Always use `workspace:_` for workspace dependencies:

```json
{
  "dependencies": {
    "shared-utils": "workspace:_"  // ✅ Explicit workspace dependency
  }
}
```

### 4. Test in Dependency Order

Run tests in dependency order to catch issues early:

```bash
pantry run test --filter '_'
```

### 5. Document Dependencies

Add comments explaining why dependencies exist:

```json
{
  "dependencies": {
    // Required for shared TypeScript types
    "shared-types": "workspace:_"
  }
}
```

## FAQ

**Q: Can I disable dependency ordering?**
A: Currently, no. It's enabled by default and ensures correct execution order. A future update may add a `--no-order` flag.

**Q: How does Pantry handle version ranges?**
A: For workspace members, version constraints are ignored. `workspace:*`, `workspace:^1.0.0`, and `workspace:~1.0.0` are all treated the same.

**Q: What if I have external dependencies with the same name as workspace members?**
A: Pantry only considers dependencies that actually point to workspace members (using `workspace:*` protocol or exact path matches).

**Q: Can I see the dependency graph?**
A: Not yet, but this is a planned feature. For now, you can infer it from the execution order when running scripts.

**Q: Does this work with TypeScript project references?**
A: Yes! Pantry's dependency ordering complements TypeScript's project references. Both help ensure correct build order.

---

## See Also

- [Filter Documentation](./filter.md) - Pattern matching for workspace packages
- [Workspace Configuration](./workspaces.md) - Setting up monorepos
- [Script Execution](./scripts.md) - Running scripts across packages
