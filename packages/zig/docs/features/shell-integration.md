# Shell Integration

Pantry integrates seamlessly with your shell to provide automatic environment activation, PATH management, and runtime version switching.

## Overview

Shell integration enables:

- Automatic environment activation on `cd`
- Runtime version switching per project
- PATH management for binaries
- Hook system for custom workflows
- Multi-shell support (zsh, bash, fish)

## Installation

### Automatic setup

```bash
pantry shell:integrate
```

This command:

1. Detects your shell (zsh, bash, or fish)
2. Generates shell-specific hook code
3. Appends hooks to your RC file (~/.zshrc, ~/.bashrc, ~/.config/fish/config.fish)
4. Activates immediately

### Manual setup

If you prefer manual installation, add this to your shell RC file:

#### zsh (~/.zshrc)

```bash
# Pantry shell integration
eval "$(pantry shell:init zsh)"
```

#### bash (~/.bashrc)

```bash
# Pantry shell integration
eval "$(pantry shell:init bash)"
```

#### fish (~/.config/fish/config.fish)

```fish
# Pantry shell integration
pantry shell:init fish | source
```

## How It Works

### Directory change detection

When you `cd` into a directory, Pantry:

1. Checks for `pantry.json`, `package.json`, or lockfiles
2. Computes project hash from dependencies
3. Looks up environment in cache (1-hour TTL)
4. If cached: Activates instantly (<50μs)
5. If not cached: Creates/updates environment
6. Installs runtimes and dependencies
7. Updates PATH with runtime binaries first
8. Auto-starts configured services

### PATH management

Pantry manages PATH with the following priority:

1. **Runtime binaries** (highest priority)
   - `~/.pantry/runtimes/bun/1.3.0/bin`
   - `~/.pantry/runtimes/node/20.10.0/bin`

2. **Project-local binaries**
   - `{project}/pantry/.bin`

3. **Environment binaries**
   - `~/.pantry/envs/{hash}/bin`

4. **System PATH** (lowest priority)
   - Your existing PATH

This ensures project-specific runtimes and packages always take precedence.

## Manual Activation

Force activate an environment:

```bash
pantry shell:activate /path/to/project
```

This is useful for:

- Activating without `cd`
- Testing environment setup
- CI/CD pipelines
- Scripts

## Environment Variables

Pantry exports these environment variables:

```bash
PANTRY_CURRENT_PROJECT="/path/to/project"
PANTRY_ENV_BIN_PATH="/path/to/env/bin"
PANTRY_ENV_DIR="/path/to/env"
PATH="runtime_bins:project_bins:env_bins:$PATH"
```

Access them in your scripts:

```bash
echo $PANTRY_CURRENT_PROJECT
# /Users/you/projects/my-app

echo $PANTRY_ENV_DIR
# /Users/you/.pantry/envs/abc123def456
```

## Examples

### Basic project activation

```bash
# Create project
mkdir my-app
cd my-app
echo '{"dependencies":{"bun":"1.3.0"}}' > pantry.json

# Activate (happens automatically on cd)
cd .
# 🔧 Setting up environment
# 📦 Installing bun@1.3.0
# ✅ Environment ready: my-app

which bun
# /Users/you/.pantry/runtimes/bun/1.3.0/bin/bun
```

### Version switching

```bash
cd my-app
bun --version
# 1.3.0

# Update version
vim pantry.json  # Change bun: "1.3.0" → "1.3.1"

cd .
# 🔄 Dependencies changed, updating environment
# 📦 Installing bun@1.3.1
# ✅ Environment updated

bun --version
# 1.3.1
```

### Multiple projects

```bash
# Project A with Bun 1.3.0
cd ~/projects/app-a
which bun
# /Users/you/.pantry/runtimes/bun/1.3.0/bin/bun

# Project B with Bun 1.3.1
cd ~/projects/app-b
which bun
# /Users/you/.pantry/runtimes/bun/1.3.1/bin/bun

# Project C with Node 20.10.0
cd ~/projects/app-c
which node
# /Users/you/.pantry/runtimes/node/20.10.0/bin/node
```

### Service auto-start

```json
{
  "name": "my-app",
  "dependencies": {
    "node": "20.10.0"
  },
  "services": {
    "postgres": true,
    "redis": true
  }
}
```

```bash
cd my-app
# 🔧 Setting up environment
# 📦 Installing node@20.10.0
# ✅ Environment ready: my-app
# 🚀 Starting service: postgres
# ✅ postgres started
# 🚀 Starting service: redis
# ✅ redis started
```

## Hook System

Pantry uses shell hooks to detect directory changes:

### zsh hook

```bash
autoload -U add-zsh-hook
add-zsh-hook chpwd _pantry_hook

_pantry_hook() {
  eval "$(pantry shell:activate "$PWD")"
}
```

### bash hook

```bash
_pantry_hook() {
  eval "$(pantry shell:activate "$PWD")"
}
PROMPT_COMMAND="_pantry_hook${PROMPT_COMMAND:+;$PROMPT_COMMAND}"
```

### fish hook

```fish
function _pantry_hook --on-variable PWD
  pantry shell:activate "$PWD" | source
end
```

## Custom Hooks

You can add custom logic to the activation process:

```bash
# ~/.zshrc
_pantry_hook() {
# Run pantry activation
  eval "$(pantry shell:activate "$PWD")"

# Custom logic after activation
  if [ -f ".envrc" ]; then
    source .envrc
  fi

# Show project info
  if [ -n "$PANTRY_CURRENT_PROJECT" ]; then
    echo "📂 Project: $(basename $PANTRY_CURRENT_PROJECT)"
  fi
}
```

## Performance

Shell integration is **extremely fast**:

| Operation | Time | Notes |
|-----------|------|-------|
| Hook invocation | <1ms | Shell function call |
| Cache hit | <50μs | Environment lookup + PATH update |
| Cache miss (first time) | 100-500ms | Runtime install + dependency setup |
| Subsequent activations | <50μs | Cached (1-hour TTL) |

## Best Practices

### 1. Use automatic integration

Let Pantry set up shell hooks automatically:

```bash
pantry shell:integrate
```

### 2. Add custom logic after hooks

```bash
_pantry_hook() {
  eval "$(pantry shell:activate "$PWD")"

# Your custom logic here
  [ -f .env ] && source .env
}
```

### 3. Test environment activation

```bash
# Test activation without cd
pantry shell:activate /path/to/project
```

### 4. Check environment variables

```bash
# Verify Pantry is active
env | grep PANTRY_
```

### 5. Clear cache if issues

```bash
# Clear environment cache
pantry cache:clear

# Re-activate
cd .
```

## Troubleshooting

### Environment not activating

```bash
# Check if hooks are installed
grep pantry ~/.zshrc  # or ~/.bashrc, ~/.config/fish/config.fish

# Reinstall hooks
pantry shell:integrate
```

### Wrong runtime version

```bash
# Check which runtime is active
which bun
node --version

# Clear cache and re-activate
pantry cache:clear
cd .
```

### PATH issues

```bash
# Check PATH priority
echo $PATH | tr ':' '\n'

# Should see pantry paths first
# /Users/you/.pantry/runtimes/bun/1.3.0/bin
# /path/to/project/pantry/.bin
# /Users/you/.pantry/envs/hash/bin
# ... system paths
```

### Services not starting

```bash
# Check service status
pantry service:status postgres

# Check pantry.json config
cat pantry.json | grep -A 5 services

# Manually start service
pantry service:start postgres
```

## Shell-Specific Features

### zsh

- Uses `chpwd` hook for directory changes
- Supports `autoload` for cleaner integration

### bash

- Uses `PROMPT_COMMAND` for directory changes
- Compatible with existing `PROMPT_COMMAND` logic

### fish

- Uses `--on-variable PWD` event handler
- Native fish shell syntax

## Next Steps

- [Runtime Management](./runtime-management.md) - Understand runtime version management
- [Environment Management](./environments.md) - Learn about environment lifecycle
- [Services](./services.md) - Configure auto-starting services
