# Bun vs Node.js Engines Conflict Test Environment

This test environment verifies that when `packageManager: "bun"` is specified, pantry prioritizes Bun over Node.js even when:

- `engines.node` is specified
- `volta.node` is configured
- Traditional Node.js tools are used

## Expected Behavior

When running `pantry install` in this directory:

1. **Should install Bun** (from packageManager)
2. **Should NOT install Node.js** (despite engines and volta config)
3. **Should create node symlink** pointing to Bun for compatibility
4. **Should ignore volta configuration** when Bun is package manager

## Key Features Tested

- ✅ Package manager priority over engines
- ✅ Package manager priority over volta
- ✅ Node.js compatibility symlink creation
- ✅ Engines specification ignored when using Bun

## Test Commands

```bash
# Install - should only get Bun, no Node.js
pantry install --verbose

# Verify only Bun is installed
bun --version

# Verify node symlink points to Bun
node --version  # Should show Bun version, not Node.js

# Test that npm/volta settings are ignored
which node  # Should point to pantry's Bun symlink
which npm   # Should not exist or point to Bun's npm

# Test ESLint works via Bun
bunx eslint --version
```

## Critical Success Criteria

1. **Only Bun installed** - no Node.js despite engines/volta
2. **Node compatibility** - `node` command works via Bun symlink
3. **Tool compatibility** - npm packages work with Bun runtime
4. **Priority logic** - packageManager overrides other configs

## Debugging Commands

```bash
# Check what was actually installed
pantry doctor

# Verify environment setup
echo $BUN_INSTALL
ls -la ~/.local/share/pantry/*/bin/
```
