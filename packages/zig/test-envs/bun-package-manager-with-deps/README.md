# Bun Package Manager with Dependencies Test Environment

This test environment verifies that pantry correctly handles complex scenarios with:

- `packageManager: "bun@latest"`
- Additional dependencies from `dependencies.yaml`
- React/Next.js toolchain
- Multiple tools that traditionally require Node.js

## Expected Behavior

When running `pantry install` in this directory:

1. **Should install Bun latest** (from packageManager)
2. **Should install additional tools** (from dependencies.yaml)
3. **Should NOT install Node.js** (despite React/Next.js dependencies)
4. **Should handle complex npm packages** that expect Node.js environment

## Key Features Tested

- ✅ Mixed package sources (packageManager + dependencies.yaml)
- ✅ Complex npm packages (Next.js, React, ESLint)
- ✅ Tools that typically require Node.js runtime
- ✅ Global vs package-manager tools coexistence

## Test Commands

```bash
# Install all dependencies
pantry install --verbose

# Verify Bun is latest version
bun --version

# Test Next.js (requires Node.js-like environment)
bunx next --version

# Test ESLint (the critical case)
bunx eslint --version
bun run lint

# Test Prettier (another Node.js tool)
bunx prettier --version
bun run prettier

# Verify additional tools from dependencies.yaml
esbuild --version
swc --version
fd --version
```

## Critical Success Criteria

1. **No Node.js installation** despite complex npm dependencies
2. **All bunx commands work** without "env: node" errors
3. **Next.js development server** can start with Bun
4. **Build tools** work correctly with Bun environment
