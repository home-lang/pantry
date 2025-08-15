# Bun Package Manager Basic Test Environment

This test environment verifies that Launchpad correctly handles `packageManager: "bun"` without a version specification.

## Expected Behavior

When running `launchpad install` in this directory:

1. **Should install Bun** (latest version)
2. **Should NOT install Node.js** (since Bun is the package manager)
3. **Should create proper Bun environment** with:
   - `bunx` symlink to `bun`
   - `node` symlink to `bun` (for package compatibility)
   - `.bun/install/global/` directory structure
   - `BUN_INSTALL` environment variable in shim

## Key Features Tested

- ✅ Package manager detection without version
- ✅ Node.js exclusion when Bun is package manager
- ✅ Bun environment setup
- ✅ Compatibility shims creation

## Test Commands

```bash
# Install packages
launchpad install --verbose

# Verify Bun is installed and working
bunx --version
bun --version

# Verify Node.js compatibility
node --version  # Should actually call Bun

# Test package management
bunx eslint --version  # Should work without "env: node" error
```
