# Bun Package Manager Versioned Test Environment

This test environment verifies that pantry correctly handles `packageManager: "bun@1.2.20"` with a specific version.

## Expected Behavior

When running `pantry install` in this directory:

1. **Should install Bun v1.2.20** (exact version specified)
2. **Should NOT install Node.js** (since Bun is the package manager)
3. **Should work with TypeScript** out of the box
4. **Should handle dev dependencies** like ESLint correctly

## Key Features Tested

- ✅ Package manager detection with specific version
- ✅ TypeScript compilation support
- ✅ ESLint integration via `bunx`
- ✅ Fastify web server with Bun

## Test Commands

```bash
# Install packages with specific Bun version
pantry install --verbose

# Verify exact Bun version
bun --version  # Should show v1.2.20

# Test TypeScript compilation
bun run dev

# Test ESLint (the original failing case!)
bun run lint

# Test building
bun run build
```

## Critical Test Case

This environment specifically tests the original issue:

```bash
bunx eslint src/ --fix
```

This should **NOT** produce the error:

```
env: node: No such file or directory
```
