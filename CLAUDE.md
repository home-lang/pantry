# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Launchpad is a modern dependency manager for both system and project environments. It's like Homebrew but faster, with intelligent environment isolation and project-aware dependency management. Built on TypeScript with Bun runtime.

**Core Technologies:**

- TypeScript with strict typing
- Bun runtime and package manager
- pkgx ecosystem integration via ts-pkgx
- CAC for CLI framework
- Cross-platform (macOS, Linux, Windows)

## Project Structure

```text
launchpad/                     # Monorepo root
├── packages/
│   ├── launchpad/            # Main CLI package
│   │   ├── src/
│   │   │   ├── cli/          # CLI parsing & routing (modular router)
│   │   │   ├── commands/     # Command implementations (lazy loaded)
│   │   │   │   ├── benchmark/   # Benchmark commands
│   │   │   │   ├── cache/       # Cache management commands
│   │   │   │   ├── db/          # Database commands
│   │   │   │   ├── debug/       # Debug commands
│   │   │   │   ├── env/         # Environment management commands
│   │   │   │   ├── index.ts     # Command registry
│   │   │   │   └── *.ts         # Individual commands
│   │   │   ├── dev/          # Development utilities
│   │   │   ├── services/     # Service management
│   │   │   └── *.ts          # Core modules (install, config, types)
│   │   ├── test/             # Test files (*.test.ts)
│   │   ├── bin/
│   │   │   ├── cli.ts        # CLI entry point
│   │   │   └── launchpad     # Compiled binary (gitignored)
│   │   ├── build.ts          # Build script
│   │   └── package.json
│   └── action/               # GitHub Action
├── docs/                     # VitePress documentation
├── scripts/                  # Utility scripts (PHP version checking, etc.)
└── launchpad.config.ts       # Example project configuration
```

## Architecture

### Command Flow

1. **Entry Point**: `bin/cli.ts` is the CLI entry point
2. **Router Selection**:
   - Default: Uses `@stacksjs/clapp` (CAC-based) framework
   - Experimental: Set `LAUNCHPAD_USE_ROUTER=1` to use `src/cli/router.ts`
3. **Command Resolution**: `src/commands/index.ts` lazily loads command modules
4. **Execution**: Commands implement `Command` interface and return exit codes

### Installation Architecture

The installation flow is modular:

```text
install-main.ts (main install() function)
  → package-resolution.ts (resolve package names/versions via ts-pkgx)
  → dependency-resolution.ts (resolve dependency graphs)
  → install-core.ts (download & extract packages)
  → cache.ts (check cache before downloading)
  → symlink.ts (create version symlinks)
  → special-installers.ts (handle special cases like SQLite)
```

### Configuration Loading

Configuration is loaded via `bunfig` with this precedence:

1. CLI flags (highest priority)
2. Environment variables (e.g., `LAUNCHPAD_DB_USERNAME`)
3. `launchpad.config.ts` in project root
4. Default values in `src/config.ts`

### Service Management

Services follow a lifecycle:

```text
src/services/definitions.ts (service definitions)
  → src/services/manager.ts (lifecycle management)
  → src/services/platform.ts (platform-specific control)
    → launchd (macOS) or systemd (Linux)
```

## Development Guidelines

### Code Style & Patterns

1. **TypeScript Standards:**
   - Use strict TypeScript with full type safety
   - Leverage ts-pkgx types for package management
   - Export types alongside implementations
   - Use interface/type definitions from `src/types.ts`

2. **Architecture Patterns:**
   - Commands follow the pattern: `src/commands/<command>.ts`
   - Each command exports a default function that handles the operation
   - Services are organized in `src/services/` with clear separation of concerns
   - Configuration is centralized in `src/config.ts`

3. **CLI Structure:**
   - Main CLI entry point: `packages/launchpad/bin/cli.ts`
   - Uses `@stacksjs/clapp` (CAC-based) framework for command parsing
   - Experimental modular router available via `LAUNCHPAD_USE_ROUTER=1` env var
   - Command resolution happens via `src/commands/index.ts` with lazy loading
   - All commands implement the `Command` interface from `src/cli/types.ts`
   - Commands receive `{ argv, env }` and return exit codes
   - All commands support `--verbose`, `--dry-run` where applicable

### Key Modules & Their Purpose

**Core Installation:**

- `src/install.ts` - Main entry point for package installation (re-exports from sub-modules)
- `src/install-main.ts` - Core `install()` function implementation
- `src/install-core.ts` - Package download and extraction logic
- `src/install-helpers.ts` - Helper utilities for installation
- `src/special-installers.ts` - Special handling for packages like SQLite (build from source)
- `src/uninstall.ts` - Package removal logic

**Package Management:**

- `src/package-resolution.ts` - Package name/version resolution, leverages ts-pkgx
- `src/dependency-resolution.ts` - Resolves package dependency graphs
- `src/cache.ts` - Package download caching with metadata
- `src/symlink.ts` - Symlink management for installed packages

**Configuration & Environment:**

- `src/config.ts` - Configuration management with bunfig
- `src/config-validation.ts` - Config validation logic
- `src/types.ts` - Type definitions (extends ts-pkgx types)
- `src/env.ts` - Environment variable management
- `src/dev-setup.ts` - Development environment setup

**CLI & Commands:**

- `src/cli/router.ts` - Lightweight modular CLI router (experimental)
- `src/cli/parse.ts` - Argument parsing utilities
- `src/cli/types.ts` - CLI type definitions (Command interface)
- `src/commands/index.ts` - Command registry with lazy loading
- `src/commands/*.ts` - Individual command implementations

**Services:**

- `src/services/definitions.ts` - Service definitions (PostgreSQL, Redis, etc.)
- `src/services/manager.ts` - Service lifecycle management
- `src/services/platform.ts` - Platform-specific service control (launchd/systemd)
- `src/services/database.ts` - Database service configuration

**Development Tools:**

- `src/dev/index.ts` - Development utilities entry point
- `src/dev/shellcode.ts` - Shell integration code generation
- `src/dev/sniff.ts` - Project detection and analysis
- `src/dev/integrate.ts` - Shell integration setup
- `src/dev/benchmark.ts` - Performance benchmarking utilities

**Utilities:**

- `src/utils.ts` - General utilities (PATH management, etc.)
- `src/path.ts` - Path resolution utilities
- `src/logging.ts` - Logging and progress display
- `src/progress.ts` - Progress bar implementation

### Important Configuration Files

- `launchpad.config.ts` - Project-level configuration with typed dependencies
- `packages/launchpad/package.json` - Package metadata and scripts
- Root `package.json` - Monorepo workspace configuration

## Development Commands

```bash
# Build the project (builds all packages in monorepo)
bun run build

# Build single package (transpiles TypeScript to dist/)
cd packages/launchpad && bun run build

# Compile CLI binary (creates bin/launchpad executable)
cd packages/launchpad && bun run compile

# Compile for all platforms (creates binaries for Linux/macOS/Windows x64/ARM)
cd packages/launchpad && bun run compile:all

# Compile for specific platform
cd packages/launchpad && bun run compile:darwin-arm64
cd packages/launchpad && bun run compile:linux-x64

# Run all tests
bun test

# Run specific test file
bun test packages/launchpad/test/utils.test.ts

# Run tests matching pattern
bun test --test-name-pattern "environment"

# Lint and fix code
bun run lint
bun run lint:fix

# Type checking
bun run typecheck

# Development docs server
bun run dev:docs

# Build documentation
bun run build:docs

# Generate changelog
bun run changelog

# Benchmark commands (via compiled binary)
./packages/launchpad/bin/launchpad benchmark:cache
./packages/launchpad/bin/launchpad benchmark:file-detection

# Utility scripts
bun scripts/get-php-versions.ts        # Fetch latest PHP versions
bun scripts/check-php-updates.ts       # Check for PHP version updates
```

**Build Process**:

1. `bun run build` → Runs `build.ts` which uses `bun-plugin-dtsx`
2. TypeScript files in `src/` are compiled to `dist/`
3. Type declarations are bundled into `dist/index.d.ts`
4. `bun run compile` → Creates standalone binary from `dist/bin/cli.js`
5. Binary includes Bun runtime and all dependencies (60MB+)

## Key Features to Understand

1. **Dual Installation Mode:**
   - System-wide: `/usr/local` (default) or `~/.local`
   - Project-specific: Automatic environment isolation

2. **Service Management:**
   - 30+ pre-configured services (PostgreSQL, Redis, etc.)
   - Cross-platform service control (launchd/systemd)
   - Auto-configuration with sane defaults

3. **Environment Management:**
   - Automatic project detection via dependency files
   - Human-readable environment identifiers
   - Seamless environment switching on `cd`

4. **Package Resolution:**
   - Leverages pkgx ecosystem via ts-pkgx
   - Full type safety for package names and versions
   - Intelligent dependency resolution

## Common Development Tasks

### Adding New Commands

Commands use a lazy-loading pattern for performance. Here's how to add one:

1. **Create command file** in `src/commands/<name>.ts`:

   ```typescript
   import type { Command } from '../cli/types'

   const command: Command = {
     name: 'my-command',
     description: 'Description of what this command does',
     async run({ argv, env, options }) {
       // Command implementation
       // Parse argv for flags/arguments
       // Return exit code (0 = success, non-zero = error)
       return 0
     },
   }

   export default command
   ```

2. **Register command** in `src/commands/index.ts`:

   ```typescript
   const registry: Record<string, () => Promise<Command>> = {
     // ... existing commands
     'my-command': async () => (await import('./my-command')).default,
   }
   ```

3. **Add CLI definition** in `bin/cli.ts` (if using clapp framework):

   ```typescript
   cli
     .command('my-command [args...]', 'Description')
     .option('--flag', 'Flag description')
     .action(async (args, options) => {
       const cmd = await resolveCommand('my-command')
       const code = await cmd.run({ argv: args, env: process.env })
       process.exit(code)
     })
   ```

4. **Add tests** in `test/my-command.test.ts` following Bun test conventions

### Adding New Services

1. Add service definition to `src/services/definitions.ts`
2. Update service management logic in `src/services/manager.ts`
3. Add platform-specific configurations if needed
4. Update documentation and examples

### Configuration Changes

1. Update `LaunchpadConfig` interface in `src/types.ts`
2. Update default config in `src/config.ts`
3. Update example `launchpad.config.ts` if needed
4. Document new options in README

## Testing & Quality

**Test Framework**: Bun's built-in test runner (`bun:test`)

**Test Location**: `packages/launchpad/test/*.test.ts`

**Test Patterns**:

```typescript
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

describe('Feature', () => {
  beforeEach(() => {
    // Setup
  })

  afterEach(() => {
    // Cleanup - restore environment, delete temp files
  })

  it('should do something', () => {
    expect(result).toBe(expected)
  })
})
```

**Quality Checklist**:

- All code must pass `bun run typecheck` (strict TypeScript)
- All code must pass `bun run lint` (ESLint with `@stacksjs/eslint-config`)
- Tests should clean up after themselves (temp files, env vars)
- Test both system-wide and project-specific installation modes when relevant
- Verify cross-platform compatibility for system-level operations
- Mock filesystem operations when testing without side effects

**Pre-commit Hooks**:

- Staged files are automatically linted via `git-hooks` (see root `package.json`)
- Commit messages are validated with `gitlint`

## Dependencies & Ecosystem

**Core Dependencies**:

- **ts-pkgx** (v0.4.93+): Provides typed package definitions from pkgx ecosystem - all package names and versions are fully typed
- **@stacksjs/clapp** (v0.2.0): CAC-based CLI framework for command parsing
- **bunfig** (v0.15.0+): Configuration file loading with TypeScript support

**Build Tools**:

- **bun-plugin-dtsx** (v0.9.5): TypeScript declaration bundler for build process
- **TypeScript** (v5.9.2+): Strict type checking

**Development Tools**:

- **@stacksjs/eslint-config**: Shared ESLint configuration
- **bun-git-hooks**: Git hook management

**Runtime**: Built for Bun but maintains Node.js compatibility where possible

**Package Resolution**: All packages come from the pkgx/pantry ecosystem via ts-pkgx types

## Special Considerations

1. **Cross-platform Compatibility:** Code must work on macOS, Linux, and Windows
2. **Permission Handling:** Smart handling of system vs user installations
3. **Environment Isolation:** Never pollute global environment unintentionally
4. **Performance:** Leverage Bun's speed advantages where possible
5. **Type Safety:** Full TypeScript compliance with ts-pkgx integration

## Integration Points

- **GitHub Actions:** `packages/action/` provides CI/CD integration
- **Shell Integration:** Automatic PATH management and environment switching
- **pkgx Ecosystem:** Full compatibility with pkgx package registry
- **Service Orchestration:** Native integration with system service managers

When working on this project, always consider the dual nature of system-wide and project-specific dependency management, maintain cross-platform compatibility, and leverage the strong typing provided by ts-pkgx for package management operations.
