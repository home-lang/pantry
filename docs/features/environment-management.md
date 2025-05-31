# Environment Management

Launchpad provides powerful environment management capabilities that automatically isolate project dependencies and provide tools for managing these environments. This guide covers all aspects of environment management, from automatic activation to manual cleanup.

## Overview

Environment management in Launchpad consists of two main components:

1. **Automatic Environment Isolation** - Project-specific environments that activate when you enter a directory
2. **Environment Management Tools** - CLI commands for listing, inspecting, cleaning, and removing environments

## Automatic Environment Isolation

### How It Works

When you enter a directory containing dependency files (like `dependencies.yaml`), Launchpad automatically:

1. **Generates a unique environment hash** based on the project path
2. **Creates an isolated environment directory** at `~/.local/share/launchpad/envs/{hash}/`
3. **Installs project-specific packages** to the isolated environment
4. **Modifies PATH** to prioritize the project's binaries
5. **Sets up environment variables** as specified in the dependency file
6. **Creates deactivation hooks** to restore the original environment when leaving

### Environment Hash Format

Launchpad uses a human-readable hash format for environment directories:

**Format:** `{project-name}_{8-char-hex-hash}`

**Examples:**
- `my-web-app_1a2b3c4d` - For a project in `/home/user/projects/my-web-app`
- `api-server_5e6f7g8h` - For a project in `/work/api-server`
- `final-project_7db6cf06` - For a deeply nested project

**Benefits:**
- **Human-readable** - Easy to identify which project an environment belongs to
- **Unique** - 8-character hex hash prevents collisions between projects
- **Consistent** - Same project path always generates the same hash
- **Collision-resistant** - Different paths with same project name get different hashes

### Supported Dependency Files

Launchpad automatically detects these dependency files:

- `dependencies.yaml` / `dependencies.yml`
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
cd ../          # → 🔄 dev environment deactivated
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

# Clean with default settings (30 days old)
launchpad env:clean

# Clean environments older than 7 days
launchpad env:clean --older-than 7

# Force cleanup without confirmation
launchpad env:clean --force

# Verbose cleanup with details
launchpad env:clean --verbose
```

**Cleanup criteria:**
- **Failed installations** - Environments with no binaries
- **Age-based cleanup** - Environments older than specified days (default: 30)
- **Empty directories** - Environments with no packages or binaries

**Example output:**
```
🧹 Cleaning up development environments...

Found 3 environment(s) to clean:

🗑️  old-project
    Hash: old-project_1a2b3c4d
    Size: 1.2M
    Created: 4/15/2025
    Reason: older than 30 days

🗑️  failed-install
    Hash: failed-install_5e6f7g8h
    Size: 0B
    Created: 5/29/2025
    Reason: no binaries (failed installation)

💾 Total space to be freed: 1.2M

🤔 Clean 3 environment(s)? (y/N):
```

### Removing Specific Environments

The `env:remove` command removes individual environments:

```bash
# Remove with confirmation
launchpad env:remove dummy_6d7cf1d6

# Force removal without confirmation
launchpad env:remove minimal_3a5dc15d --force

# Verbose removal showing details
launchpad env:remove working-test_208a31ec --verbose
```

**Example output:**
```
🗑️  Removing environment: dummy
    Hash: dummy_6d7cf1d6
    Size: 1.1M

🤔 Remove environment 'dummy'? (y/N): y

✅ Environment 'dummy' removed successfully
💾 Space freed: 1.1M
```

## Environment Directory Structure

Each environment has a standardized directory structure:

```
~/.local/share/launchpad/envs/{project-name}_{hash}/
├── bin/           # Executable binaries and stubs
├── sbin/          # System binaries
├── pkgs/          # Package installations
│   └── {package}/
│       └── v{version}/
├── lib/           # Libraries
├── share/         # Shared data
└── etc/           # Configuration files
```

### Binary Stubs

Launchpad creates isolated binary stubs that:

- **Set up environment variables** before executing the real binary
- **Restore original environment** after execution
- **Provide isolation** between different project environments
- **Handle complex PATH scenarios** with multiple package versions

**Example stub structure:**
```bash
#!/bin/sh
# Project-specific binary stub - environment is isolated
# Created for python from python.org

# Store original environment variables for restoration
_ORIG_PATH="$PATH"
_ORIG_LD_LIBRARY_PATH="$LD_LIBRARY_PATH"
# ... more environment setup

# Set project-specific environment
export PATH="/path/to/project/env/bin:$_ORIG_PATH"
export PYTHONPATH="/path/to/project/env/lib/python"

# Execute the real binary
exec "/path/to/real/python" "$@"
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
