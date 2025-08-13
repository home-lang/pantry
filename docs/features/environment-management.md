# Environment Management

Launchpad provides powerful environment management capabilities that automatically isolate project dependencies and provide tools for managing these environments. This guide covers all aspects of environment management, from automatic activation to manual cleanup.

## Overview

Environment management in Launchpad consists of two main components:

1. **Automatic Environment Isolation** - Project-specific environments that activate when you enter a directory
2. **Environment Management Tools** - CLI commands for listing, inspecting, cleaning, and removing environments
3. **Shell Message Customization** - Configurable activation and deactivation messages

## Automatic Environment Isolation

### How It Works

When you enter a directory containing dependency files (like `dependencies.yaml`), Launchpad automatically:

1. **Generates a unique environment hash** based on the project path
2. **Computes a dependency fingerprint** (md5 of the dependency file content)
3. **Creates/selects an isolated environment directory** at `~/.local/share/launchpad/envs/<project>_<hash>-d<dep_hash>`
4. **Installs project-specific packages** to the isolated environment
5. **Modifies PATH** to prioritize the project's binaries
6. **Sets up environment variables** as specified in the dependency file
7. **Creates deactivation hooks** to restore the original environment when leaving
8. **Displays customizable messages** for activation and deactivation

### Environment Hash Format

Launchpad uses a human-readable hash format for environment directories:

**Format:** `{project-name}_{8-char-hex-hash}-d{8-char-dep-hash}`

**Examples:**
- `my-web-app_1a2b3c4d-d9f1a2b3` - Project `/home/user/projects/my-web-app`, dependency fingerprint `d9f1a2b3`
- `api-server_5e6f7g8h-d0c1e2f3` - Project `/work/api-server`, dependency fingerprint `d0c1e2f3`

**Benefits:**
- **Human-readable** - Easy to identify which project an environment belongs to
- **Version-aware** - Dependency changes always map to a distinct environment
- **Unique** - 8-character hex hash prevents collisions between projects
- **Consistent** - Same project path and same deps yield the same env path
- **Collision-resistant** - Different paths with same project name get different hashes

### Supported Dependency Files

Launchpad automatically detects these dependency files:

- `dependencies.yaml` / `dependencies.yml`
- `.launchpad.yaml` / `launchpad.yaml`
- `.launchpad.yml` / `launchpad.yml`
- `deps.yml` / `deps.yaml`
- `.deps.yml` / `.deps.yaml`

For pkgx compatibility, Launchpad also supports:
- `pkgx.yaml` / `pkgx.yml`
- `.pkgx.yaml` / `.pkgx.yml`

**Example dependency file:**
```yaml
dependencies:
  - node@22
  - python@3.12
  - gnu.org/wget@1.21

env:
  NODE_ENV: development
  API_URL: https://api.example.com
  DATABASE_URL: postgresql://localhost/myapp
```

#### Global Installation Control

Control where packages are installed using the `global` flag:

**Individual Package Control:**
```yaml
# dependencies.yaml
dependencies:
  # Global packages (installed to /usr/local)
  node@22:
    version: 22.1.0
    global: true
  python@3.12:
    version: 3.12.1
    global: true

  # Local packages (project-specific installation)
  typescript@5.0:
    version: 5.0.4
    global: false

  # String format defaults to local
  - eslint@8.50

env:
  NODE_ENV: development
```

**Top-Level Global Flag:**
```yaml
# dependencies.yaml
global: true  # Install all packages globally by default
dependencies:
  - node@22
  - python@3.12
  - git@2.42

  # Override specific packages to be local
  typescript@5.0:
    version: 5.0.4
    global: false

env:
  NODE_ENV: development
```

**Global Installation Behavior:**
- **Global packages** (`global: true`): Installed system-wide, available in all environments
- **Local packages** (`global: false` or default): Installed per-project, isolated from other environments
- **Mixed approach**: Combine global tools with project-specific dependencies
- **Precedence**: Individual package `global` flags override top-level `global` setting

### Shell Integration

To enable automatic environment activation, add shell integration:

```bash
# Add to your shell configuration
echo 'eval "$(launchpad dev:shellcode)"' >> ~/.zshrc

# Reload your shell
source ~/.zshrc
```

Once set up, environments automatically activate:

```bash
cd my-project/  # → ✅ Environment activated for /path/to/my-project
cd ../          # → dev environment deactivated
```

### Customizing Shell Messages

You can customize or disable environment activation/deactivation messages:

#### Disabling Messages

```bash
# Disable all environment messages
export LAUNCHPAD_SHOW_ENV_MESSAGES=false

# Or in configuration file
echo 'export default { showShellMessages: false }' > launchpad.config.ts
```

#### Custom Activation Messages

```bash
# Environment variable (use {path} placeholder for project path)
export LAUNCHPAD_SHELL_ACTIVATION_MESSAGE="🚀 Project environment loaded: {path}"

# Or in configuration file
echo 'export default {
  shellActivationMessage: "🔧 Development environment ready: {path}"
}' > launchpad.config.ts
```

#### Custom Deactivation Messages

```bash
# Environment variable
export LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE="👋 Project environment closed"

# Or in configuration file
echo 'export default {
  shellDeactivationMessage: "🔒 Environment closed"
}' > launchpad.config.ts
```

#### Message Examples

Different styles you can use:

```bash
# Minimal style
export LAUNCHPAD_SHELL_ACTIVATION_MESSAGE="[ENV] {path}"
export LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE="[ENV] closed"

# Detailed style
export LAUNCHPAD_SHELL_ACTIVATION_MESSAGE="🔧 Development environment ready for {path}"
export LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE="👋 Development environment deactivated"

# Emoji style
export LAUNCHPAD_SHELL_ACTIVATION_MESSAGE="📁 {path} 🚀"
export LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE="🏠 Back to global environment"
```

## Environment Management Commands

### Listing Environments

The `env:list` command shows all your development environments:

```bash
# Basic listing
launchpad env:list

# Detailed view with hashes
launchpad env:list --verbose

# JSON output for scripting
launchpad env:list --format json

# Simple format
launchpad env:ls --format simple
```

**Output formats:**

**Table (default):**
```
📦 Development Environments:

│ Project         │ Packages │ Binaries │ Size     │ Created      │
├───────────────────────────────────────────────────────────────┤
│ final-project   │ 2        │ 2        │ 5.0M     │ 5/30/2025    │
│ working-test    │ 3        │ 20       │ 324M     │ 5/30/2025    │
│ dummy           │ 1        │ 1        │ 1.1M     │ 5/30/2025    │
└───────────────────────────────────────────────────────────────┘

Total: 3 environment(s)
```

**JSON:**
```json
[
  {
    "hash": "final-project_7db6cf06",
    "projectName": "final-project",
    "packages": 2,
    "binaries": 2,
    "size": "5.0M",
    "created": "2025-05-31T01:36:49.283Z"
  }
]
```

**Simple:**
```
final-project (final-project_7db6cf06)
working-test (working-test_208a31ec)
dummy (dummy_6d7cf1d6)
```

### Inspecting Environments

The `env:inspect` command provides detailed information about a specific environment:

```bash
# Basic inspection
launchpad env:inspect working-test_208a31ec

# Detailed inspection with directory structure
launchpad env:inspect final-project_7db6cf06 --verbose

# Show binary stub contents
launchpad env:inspect dummy_6d7cf1d6 --show-stubs
```

**Example output:**
```
🔍 Inspecting environment: working-test_208a31ec

📋 Basic Information:
  Project Name: working-test
  Hash: working-test_208a31ec
  Path: /Users/user/.local/share/launchpad/envs/working-test_208a31ec
  Size: 324M
  Created: 5/30/2025, 6:38:08 PM
  Modified: 5/30/2025, 6:38:12 PM

📁 Directory Structure:
  bin/: 20 item(s)
  pkgs/: 3 item(s)
  lib/: 6 item(s)
  share/: 5 item(s)

📦 Installed Packages:
  python.org@3.12.10
  curl.se@8.5.0
  cmake.org@3.28.0

🔧 BIN Binaries:
  python (file, executable)
  curl (file, executable)
  cmake (file, executable)
  pip (file, executable)
  ...

🏥 Health Check:
  ✅ Binaries present
  ✅ 3 package(s) installed

Overall Status: ✅ Healthy
```

**Health Check Criteria:**
- **Binaries present** - Environment has executable binaries
- **Packages installed** - Package directories exist and contain files
- **Directory structure** - Required directories (bin, pkgs) exist

### Cleaning Up Environments

The `env:clean` command automatically removes unused or problematic environments:

```bash
# Preview what would be cleaned
launchpad env:clean --dry-run

# Clean environments older than 30 days (default)
launchpad env:clean

# Clean environments older than 7 days
launchpad env:clean --older-than 7

# Force cleanup without confirmation
launchpad env:clean --force

# Verbose cleanup with details
launchpad env:clean --verbose
```

**Cleanup Criteria:**
- Environments with no binaries (failed installations)
- Environments older than specified days (default: 30)
- Empty or corrupted environment directories

### Removing Specific Environments

Remove individual environments by their hash:

```bash
# Remove with confirmation
launchpad env:remove dummy_6d7cf1d6

# Force removal without confirmation
launchpad env:remove minimal_3a5dc15d --force

# Verbose removal showing details
launchpad env:remove working-test_208a31ec --verbose
```

## Advanced Environment Features

### Environment Variables and Context

Each environment can export specific variables:

```bash
# Check current environment context
echo $LAUNCHPAD_ENV_HASH
echo $LAUNCHPAD_PROJECT_NAME

# Use in scripts
if [ -n "$LAUNCHPAD_ENV_HASH" ]; then
  echo "Running in Launchpad environment: $LAUNCHPAD_PROJECT_NAME"
fi
```

### Environment Performance

- **Fast activation** - Subsequent entries to the same project use cached installations
- **Isolated PATH** - Each environment has its own binary resolution
- **Memory efficient** - Environments share common dependencies when possible
- **Disk optimization** - Human-readable hashes improve filesystem performance

### Integration with Development Tools

Environments work seamlessly with development tools:

**Node.js project example:**
```yaml
dependencies:
  - node@22
  - typescript@5.0
  - yarn@1.22

env:
  NODE_ENV: development
  TYPESCRIPT_CONFIG: ./tsconfig.dev.json
```

**Python project example:**
```yaml
dependencies:
  - python@3.12
  - pip
  - poetry@1.5

env:
  PYTHONPATH: ./src
  VIRTUAL_ENV: ./.venv
```

### Troubleshooting Environment Issues

#### Environment Not Activating

1. Check shell integration:
   ```bash
   type _pkgx_chpwd_hook
   ```

2. Verify dependency file:
   ```bash
   launchpad dev:dump --dryrun
   ```

3. Check file detection:
   ```bash
   ls -la dependencies.yaml
   ```

#### Environment Messages Not Showing

1. Check message settings:
   ```bash
   echo $LAUNCHPAD_SHOW_ENV_MESSAGES
   ```

2. Verify shell integration:
   ```bash
   grep "launchpad dev:shellcode" ~/.zshrc
   ```

3. Test manual activation:
```bash
   eval "$(launchpad dev:shellcode)"
   ```

#### Performance Issues

1. Clean old environments:
   ```bash
   launchpad env:clean --older-than 7
   ```

2. Check disk usage:
   ```bash
   du -sh ~/.local/share/launchpad/envs/*
   ```

3. Monitor activation time:
  ```bash
  time (cd my-project && cd ..)
  ```

## Best Practices

### Environment Naming

- Use descriptive project directory names
- Avoid special characters that might cause filesystem issues
- Keep project names reasonably short for readable hashes

### Dependency Management

- **Pin versions** in dependency files for reproducible environments
- **Use semantic versioning** ranges when appropriate (`^1.2.0`, `~3.1.0`)
- **Document environment variables** in your project README

### Cleanup Strategy

- **Regular cleanup** - Run `env:clean` periodically to remove old environments
- **Monitor disk usage** - Large environments can consume significant space
- **Remove unused projects** - Clean up environments for deleted projects

### Troubleshooting

**Environment not activating:**
1. Check shell integration: `echo 'eval "$(launchpad dev:shellcode)"' >> ~/.zshrc`
2. Verify dependency file exists and has correct syntax
3. Reload shell configuration: `source ~/.zshrc`

**Package installation failures:**
1. Check internet connectivity
2. Verify package names and versions exist in pkgx
3. Use `launchpad dev:dump --verbose` for detailed error information

**Hash collisions (rare):**
1. Different projects with same name get different hashes based on full path
2. If collision occurs, rename one of the project directories
3. Remove old environment: `launchpad env:remove {hash}`

## Advanced Usage

### Scripting with JSON Output

Use JSON output for automation:

```bash
#!/bin/bash
# Clean up environments larger than 100MB

envs=$(launchpad env:list --format json)
echo "$envs" | jq -r '.[] | select(.size | test("^[0-9]+[0-9][0-9]M|^[0-9]+G")) | .hash' | while read hash; do
  echo "Removing large environment: $hash"
  launchpad env:remove "$hash" --force
done
```

### Integration with CI/CD

Clean up environments in CI pipelines:

```yaml
# GitHub Actions example
- name: Clean old environments
  run: |
    launchpad env:clean --older-than 1 --force
```

### Monitoring Environment Usage

Track environment disk usage:

```bash
# Show environments sorted by size
launchpad env:list --format json | jq -r 'sort_by(.size) | reverse | .[] | "\(.projectName): \(.size)"'
```
