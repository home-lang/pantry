# Bun + Node.js Coexistence Test Environment

This test environment verifies that pantry correctly handles scenarios where both Bun and Node.js need to be installed in the same environment.

## Expected Behavior

When running `pantry install` in this directory:

1. **Should install both Bun and Node.js** (from both packageManager and dependencies.yaml)
2. **Should NOT create node symlink** (since real Node.js is installed)
3. **Should install npm** as well
4. **Both runtimes should work independently**

## Configuration Details

- `packageManager: "bun@1.2.0"` - Specifies Bun as package manager
- `engines.node: ">=20.0.0"` - Indicates Node.js requirement
- `dependencies.yaml` - Explicitly lists both `bun.sh` and `nodejs.org`

## Key Features Tested

- ✅ Bun and Node.js coexistence
- ✅ No node symlink creation when real Node.js present
- ✅ Both package managers working (bun, npm)
- ✅ Proper runtime isolation

## Test Commands

```bash
# Install both runtimes
pantry install --verbose

# Verify both are available
which bun node npm
bun --version
node --version
npm --version

# Test package management with both
bun install  # Should use Bun
npm install  # Should use npm + Node.js

# Verify no symlink conflict
ls -la bin/node  # Should be real Node.js binary, not symlink to bun
```

## Expected Results

- Both `bun` and `node` commands available
- No conflicts between runtimes
- Package installations work with both tools
- ESLint and other npm packages work with Node.js
- TypeScript compilation works with either runtime
