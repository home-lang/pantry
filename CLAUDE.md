# CLAUDE.md - Launchpad Project Rules

This file contains specific rules and guidelines for working with the Launchpad project in Claude Code.

## Project Overview

Launchpad is a modern dependency manager for both system and project environments. It's like Homebrew but faster, with intelligent environment isolation and project-aware dependency management. Built on TypeScript with Bun runtime.

**Core Technologies:**

- TypeScript with strict typing
- Bun runtime and package manager
- pkgx ecosystem integration via ts-pkgx
- CAC for CLI framework
- Cross-platform (macOS, Linux, Windows)

## Project Structure

```
launchpad/
├── packages/
│   ├── launchpad/              # Main package
│   │   ├── src/                # Core source code
│   │   │   ├── commands/       # CLI command implementations
│   │   │   ├── services/       # Service management
│   │   │   ├── cli/            # CLI parsing and routing
│   │   │   ├── dev/            # Development utilities
│   │   │   └── *.ts           # Core modules (install, config, types, etc.)
│   │   ├── bin/cli.ts         # CLI entry point
│   │   └── package.json       # Package configuration
│   └── action/                # GitHub Action package
├── docs/                      # Documentation
├── scripts/                   # Build and utility scripts
└── launchpad.config.ts        # Project configuration
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
   - Uses CAC framework for command parsing
   - Command resolution happens via `src/commands/index.ts`
   - All commands support `--verbose`, `--dry-run` where applicable

### Key Modules & Their Purpose

- `src/install.ts` - Package installation logic
- `src/uninstall.ts` - Package removal logic
- `src/config.ts` - Configuration management
- `src/types.ts` - Type definitions (extends ts-pkgx types)
- `src/services/` - Service management (PostgreSQL, Redis, etc.)
- `src/dev/` - Development environment management
- `src/commands/` - CLI command implementations

### Important Configuration Files

- `launchpad.config.ts` - Project-level configuration with typed dependencies
- `packages/launchpad/package.json` - Package metadata and scripts
- Root `package.json` - Monorepo workspace configuration

## Development Commands

```bash
# Build the project
bun run build

# Run tests
bun test

# Lint code
bun run lint
bun run lint:fix

# Type checking
bun run typecheck

# Development docs
bun run dev:docs

# Generate changelog
bun run changelog
```

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

1. Create command file in `src/commands/<name>.ts`
2. Export default function with command logic
3. Add command to `src/commands/index.ts` resolution map
4. Update CLI definitions in `bin/cli.ts`
5. Add corresponding types to `src/types.ts` if needed

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

- Use `bun test` for running tests
- All code should pass `bun run lint` and `bun run typecheck`
- Test both system-wide and project-specific installation modes
- Verify cross-platform compatibility where applicable

## Dependencies & Ecosystem

- **ts-pkgx**: Provides typed package definitions and ecosystem integration
- **CAC**: CLI argument parsing framework
- **bunfig**: Configuration management utilities
- Built for Bun runtime but Node.js compatible

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
