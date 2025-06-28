# Test Environments

This directory contains comprehensive test environments for Launchpad's global/local package installation functionality. Each test environment demonstrates different configuration patterns and edge cases.

## Test Environment Categories

### Global Installation Tests

#### `global-all/`
- **Pattern**: Top-level `global: true` with array format dependencies
- **Expected**: All packages installed globally
- **Use Case**: Development machine setup where all tools should be system-wide

#### `simple-global-string/`
- **Pattern**: Top-level `global: true` with simple string array dependencies
- **Expected**: All packages installed globally
- **Use Case**: Simple global installation with minimal configuration

#### `dev-machine-setup/`
- **Pattern**: Top-level `global: true` with comprehensive development tools
- **Expected**: All packages installed globally for system-wide availability
- **Use Case**: Setting up a development machine with standard tools

### Mixed Global/Local Tests

#### `mixed-global-local/` ⭐ **Main Example**
- **Pattern**: Top-level `global: true` with individual `global: false` overrides
- **Configuration**:
  ```yaml
  global: true
  dependencies:
    bun.sh: 1.2.3 # → Global (uses top-level)
    python.org:
      version: ^3.11
      global: false # → Local (overrides top-level)
    node@22: 22.1.0 # → Global (uses top-level)
    git@2.42: 2.42.0 # → Global (uses top-level)
  ```
- **Expected**: Mixed installation based on individual overrides
- **Use Case**: Most common pattern - global shared tools with project-specific overrides

#### `team-standard/`
- **Pattern**: Individual global flags without top-level global
- **Expected**: Global shared tools (node, python, docker, git) + local project tools
- **Use Case**: Team development environment with shared infrastructure tools

#### `fullstack-mixed/`
- **Pattern**: Complex mix with runtimes global, project tools local
- **Expected**: Global runtimes/databases, local frontend/testing tools
- **Use Case**: Full-stack development with shared infrastructure, isolated project tools

### Override Scenario Tests

#### `override-scenarios/`
- **Pattern**: Top-level `global: true` with various override patterns
- **Tests**: String format, object format, explicit global: true, explicit global: false
- **Expected**: Proper precedence handling for all override combinations

#### `global-false-override/`
- **Pattern**: Top-level `global: false` with selective `global: true` overrides
- **Expected**: Most packages local, only overridden packages global
- **Use Case**: Project-first approach with selective global tools

#### `individual-global-flags/`
- **Pattern**: No top-level global, only individual package flags
- **Expected**: Each package follows its individual global flag
- **Use Case**: Fine-grained control without top-level defaults

### Default Behavior Tests

#### `no-global-flag/`
- **Pattern**: No global flags anywhere
- **Expected**: All packages install locally (default behavior)
- **Use Case**: Traditional project-isolated installation

### Existing Test Environments

#### `complex-deps/`
- Complex dependency configuration for testing edge cases

#### `working-test/`
- Known working packages for reliable testing

#### `minimal/`
- Minimal configuration for basic functionality tests

#### `python-focused/`
- Python-specific dependency testing

#### `dummy/`
- Basic test environment

#### `test-isolation/`
- Environment isolation testing

#### `deeply-nested/`
- Deep directory structure testing

## Global Flag Precedence Rules

The test environments validate these precedence rules:

1. **Individual package `global` flag** (highest priority)
2. **Top-level `global` flag**
3. **Default behavior** (project-local installation)

## Testing the Environments

To test any environment:

```bash
# Navigate to test environment
cd test-envs/mixed-global-local

# Test dependency detection
launchpad dev:dump --dryrun

# Test actual installation (be careful!)
launchpad install

# Check environment activation
launchpad env:list
```

## Expected Behavior Summary

| Environment | Top-Level Global | Individual Overrides | Expected Result |
|-------------|------------------|---------------------|-----------------|
| `global-all` | `true` | None | All global |
| `mixed-global-local` | `true` | `python.org: false` | Mixed (python local, others global) |
| `individual-global-flags` | None | Various | Per-package settings |
| `global-false-override` | `false` | Some `true` | Mostly local, some global |
| `no-global-flag` | None | None | All local (default) |
| `team-standard` | None | Mixed | Mixed per individual flags |
| `fullstack-mixed` | None | Mixed | Runtimes global, tools local |

## Key Test Cases Covered

✅ Top-level `global: true` with all packages
✅ Top-level `global: true` with individual `global: false` overrides
✅ Top-level `global: false` with individual `global: true` overrides
✅ Individual global flags without top-level setting
✅ Mixed object and string format dependencies
✅ No global flags anywhere (default behavior)
✅ Complex real-world scenarios (team, fullstack, dev machine)
✅ String array format with top-level global
✅ Object format with version and global flags

These test environments comprehensively validate Launchpad's global/local installation functionality across all supported configuration patterns.
