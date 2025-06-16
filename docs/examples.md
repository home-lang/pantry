# Examples

This page provides practical examples of using Launchpad in real-world scenarios. These examples demonstrate common workflows and best practices.

## Getting Started Examples

### Quick Setup for a New Machine

```bash
# 1. Install Launchpad
bun add -g @stacksjs/launchpad

# 2. Bootstrap your development environment
launchpad bootstrap

# 3. Set up shell integration
echo 'eval "$(launchpad dev:shellcode)"' >> ~/.zshrc
source ~/.zshrc

# 4. Install common development tools
launchpad install node@22 python@3.12 go@1.21

# 5. Keep packages updated
launchpad update
```

### Setting Up a New Project

```bash
# 1. Create project directory
mkdir my-new-project && cd my-new-project

# 2. Create dependencies file
cat > dependencies.yaml << EOF
dependencies:
  - node@22
  - typescript@5.0
  - yarn@1.22

env:
  NODE_ENV: development
  PROJECT_NAME: my-new-project
EOF

# 3. Environment automatically activates when you enter the directory
# ✅ Environment activated for /path/to/my-new-project

# 4. Verify packages are available
node --version
tsc --version
yarn --version
```

## Project-Specific Examples

### Node.js Web Application

```yaml
# dependencies.yaml
dependencies:
  - node@22
  - yarn@1.22
  - typescript@5.0

env:
  NODE_ENV: development
  PORT: 3000
  API_URL: http://localhost:3001
  DATABASE_URL: postgresql://localhost:5432/myapp
```

### Python Data Science Project

```yaml
# dependencies.yaml
dependencies:
  - python@3.12
  - pip
  - jupyter

env:
  PYTHONPATH: ./src
  JUPYTER_CONFIG_DIR: ./.jupyter
  DATA_DIR: ./data
  MODEL_DIR: ./models
```

### Full-Stack Development

```yaml
# dependencies.yaml
dependencies:
  - node@22
  - python@3.12
  - postgresql@15
  - redis@7

env:
  NODE_ENV: development
  PYTHON_ENV: development
  DATABASE_URL: postgresql://localhost:5432/fullstack_app
  REDIS_URL: redis://localhost:6379
  API_PORT: 3001
  FRONTEND_PORT: 3000
```

### DevOps/Infrastructure Project

```yaml
# dependencies.yaml
dependencies:
  - terraform@1.5
  - kubectl@1.28
  - helm@3.12
  - aws-cli@2.13

env:
  AWS_REGION: us-west-2
  KUBE_CONFIG_PATH: ./kubeconfig
  TF_VAR_environment: development
```

## Package Update Examples

### Basic Update Operations

```bash
# Update all installed packages
launchpad update

# Update specific packages
launchpad update node python go

# Use aliases for convenience
launchpad upgrade bun
launchpad up typescript
```

### Update with Options

```bash
# Preview what would be updated
launchpad update --dry-run

# Force update to latest versions
launchpad upgrade node --latest

# Verbose updates for debugging
launchpad up --verbose python

# Update multiple packages to latest
launchpad update node bun python --latest
```

### Development Workflow Updates

```bash
# Morning routine: check for updates
launchpad update --dry-run
launchpad update

# Update development tools before starting work
launchpad upgrade typescript eslint prettier --latest

# Update runtime dependencies
launchpad up node@22 bun --latest
```

### Project-Specific Updates

```bash
# Update packages for a Node.js project
cd my-node-project
launchpad update node typescript

# Update packages for a Python project
cd my-python-project
launchpad upgrade python pip

# Update all tools for full-stack development
launchpad up node python postgresql redis --latest
```

## Advanced Configuration Examples

### Custom Installation Paths

```bash
# Install to a custom directory for a specific project
launchpad install --path ./tools node@22 python@3.12

# Use the tools from the custom directory
export PATH="$PWD/tools/bin:$PATH"
node --version
```

### Environment-Specific Configuration

```typescript
// launchpad.config.ts - Development environment
export default {
  verbose: true,
  installationPath: '~/.local',
  showShellMessages: true,
  shellActivationMessage: '🔧 DEV: {path}',
  shellDeactivationMessage: '🔧 DEV: closed',
}
```

```typescript
// launchpad.config.ts - Production environment
export default {
  verbose: false,
  installationPath: '/usr/local',
  showShellMessages: false,
  maxRetries: 5,
  timeout: 120000,
}
```

### Complex Dependencies with Version Constraints

```yaml
# dependencies.yaml
dependencies:
  # Exact versions for critical dependencies
  - node@22.1.0
  - typescript@5.0.4

  # Semver ranges for flexibility
  - eslint@^8.40.0
  - prettier@~2.8.0

  # Latest compatible versions
  - yarn@>=1.22.0
  - webpack@>=5.0.0

env:
  # Multi-line environment variables
  NODE_OPTIONS: >
    --max-old-space-size=4096
    --experimental-modules

  # Path extensions
  PATH_EXTENSION: ./node_modules/.bin:./scripts

  # Conditional variables
  DEBUG: ${{ env.NODE_ENV == 'development' && 'app:*' || '' }}
```

## Scripting Examples

### Automated Project Setup Script

```bash
#!/bin/bash
# setup-project.sh

set -e

PROJECT_NAME="$1"
PROJECT_TYPE="$2"

if [ -z "$PROJECT_NAME" ] || [ -z "$PROJECT_TYPE" ]; then
  echo "Usage: $0 <project-name> <project-type>"
  echo "Types: node, python, fullstack"
  exit 1
fi

# Create project directory
mkdir "$PROJECT_NAME" && cd "$PROJECT_NAME"

# Create dependencies based on project type
case "$PROJECT_TYPE" in
  "node")
    cat > dependencies.yaml << EOF
dependencies:
  - node@22
  - yarn@1.22
  - typescript@5.0

env:
  NODE_ENV: development
  PROJECT_NAME: $PROJECT_NAME
EOF
    ;;
  "python")
    cat > dependencies.yaml << EOF
dependencies:
  - python@3.12
  - pip
  - poetry@1.5

env:
  PYTHONPATH: ./src
  PROJECT_NAME: $PROJECT_NAME
EOF
    ;;
  "fullstack")
    cat > dependencies.yaml << EOF
dependencies:
  - node@22
  - python@3.12
  - postgresql@15

env:
  NODE_ENV: development
  PROJECT_NAME: $PROJECT_NAME
  DATABASE_URL: postgresql://localhost:5432/$PROJECT_NAME
EOF
    ;;
esac

echo "✅ Project $PROJECT_NAME created with $PROJECT_TYPE configuration"
echo "💡 Run 'cd $PROJECT_NAME' to activate the environment"
```

### Environment Cleanup Script

```bash
#!/bin/bash
# cleanup-environments.sh

echo "🧹 Cleaning up old Launchpad environments..."

# Remove environments older than 30 days
launchpad env:clean --older-than 30 --force

# Remove large environments (>500MB)
launchpad env:list --format json | \
  jq -r '.[] | select(.size | test("^[5-9][0-9][0-9]M|^[0-9]+G")) | .hash' | \
  while read hash; do
    echo "Removing large environment: $hash"
    launchpad env:remove "$hash" --force
  done

echo "✅ Cleanup complete"
```

### Package Update Script

```bash
#!/bin/bash
# update-packages.sh

echo "🔄 Checking for package updates..."

# Preview all available updates
echo "📋 Available updates:"
launchpad update --dry-run

# Ask for confirmation
read -p "Do you want to proceed with updates? (y/N): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
  # Update all packages
  launchpad update

  # Update critical tools to latest
  echo "🚀 Updating critical tools to latest versions..."
  launchpad upgrade node bun typescript --latest

  echo "✅ Package updates complete"
else
  echo "ℹ️ Updates skipped"
fi
```

## CI/CD Integration Examples

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test with Launchpad

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
        node-version: [18, 20, 22]
    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Install Launchpad
        run: npm install -g @stacksjs/launchpad

      - name: Install project dependencies
        run: |
          # Create temporary dependencies file for CI
          cat > dependencies.yaml << EOF
          dependencies:
            - node@${{ matrix.node-version }}
            - yarn@1.22
          env:
            NODE_ENV: test
            CI: true
          EOF

          # Activate environment and install packages
          launchpad dev:on

      - name: Run tests
        run: |
          node --version
          yarn install
          yarn test
```

### Docker Integration

```dockerfile
# Dockerfile
FROM ubuntu:22.04

# Install Launchpad
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://bun.sh/install | bash
RUN /root/.bun/bin/bun add -g @stacksjs/launchpad

# Copy project files
COPY . /app
WORKDIR /app

# Install project dependencies using Launchpad
RUN launchpad bootstrap --skip-shell-integration
RUN launchpad dev:on

# Start application
CMD ["node", "server.js"]
```

## Troubleshooting Examples

### Debugging Environment Issues

```bash
# Check if shell integration is working
type _pkgx_chpwd_hook

# Verify dependency file syntax
launchpad dev:dump --dryrun --verbose

# Check environment status
echo "Current environment: $LAUNCHPAD_ENV_HASH"
echo "Project name: $LAUNCHPAD_PROJECT_NAME"

# List all environments
launchpad env:list --verbose

# Test manual activation
cd my-project
launchpad dev:on
```

### Fixing Permission Issues

```bash
# Check current permissions
ls -la /usr/local/

# Fix permissions for user installation
sudo chown -R $(whoami) /usr/local/bin /usr/local/sbin

# Or use user-local installation
launchpad install --path ~/.local node@22

# Verify PATH includes user directories
echo $PATH | grep -E "(\.local/bin|\.local/sbin)"
```

### Environment Collision Resolution

```bash
# List environments to identify conflicts
launchpad env:list --format json | jq -r '.[] | "\(.projectName): \(.hash)"'

# Remove conflicting environment
launchpad env:remove problematic_hash_here --force

# Clean up old environments
launchpad env:clean --older-than 7 --force

# Recreate environment by re-entering directory
cd my-project && cd .. && cd my-project
```

## Migration Examples

### From Homebrew to Launchpad

```bash
# 1. List current Homebrew packages
brew list > homebrew-packages.txt

# 2. Install Launchpad
bun add -g @stacksjs/launchpad

# 3. Bootstrap Launchpad (installs to /usr/local, separate from Homebrew)
launchpad bootstrap

# 4. Install equivalent packages with Launchpad
launchpad install node python go

# 5. Both package managers coexist peacefully
brew list    # Homebrew packages in /opt/homebrew
launchpad list  # Launchpad packages in /usr/local
```

### From Node Version Manager to Launchpad

```bash
# 1. Check current Node versions
nvm list

# 2. Create project-specific dependencies
cat > dependencies.yaml << EOF
dependencies:
  - node@$(node --version | cut -c2-)  # Current version

env:
  NODE_ENV: development
EOF

# 3. Set up Launchpad environment
launchpad dev:on

# 4. Gradually migrate projects to use dependencies.yaml files
# Each project can specify its own Node version
```

## Best Practices Examples

### Project Template with Launchpad

```bash
# create-project-template.sh
#!/bin/bash

TEMPLATE_DIR="$HOME/.launchpad-templates"
mkdir -p "$TEMPLATE_DIR"

# Create Node.js template
cat > "$TEMPLATE_DIR/node.yaml" << EOF
dependencies:
  - node@22
  - yarn@1.22
  - typescript@5.0
  - eslint@8.40
  - prettier@2.8

env:
  NODE_ENV: development
  LOG_LEVEL: debug
EOF

# Create Python template
cat > "$TEMPLATE_DIR/python.yaml" << EOF
dependencies:
  - python@3.12
  - pip
  - poetry@1.5
  - black@23.0
  - pytest@7.0

env:
  PYTHONPATH: ./src
  PYTEST_ARGS: -v --tb=short
EOF

echo "✅ Templates created in $TEMPLATE_DIR"
echo "Usage: cp $TEMPLATE_DIR/node.yaml ./dependencies.yaml"
```

### Environment Monitoring

```bash
# monitor-environments.sh
#!/bin/bash

echo "📊 Launchpad Environment Report"
echo "================================"

# Total environments
total=$(launchpad env:list --format json | jq length)
echo "Total environments: $total"

# Disk usage
total_size=$(launchpad env:list --format json | jq -r '.[].size' | sed 's/[A-Z]//g' | awk '{sum += $1} END {print sum "M"}')
echo "Total disk usage: $total_size"

# Largest environments
echo -e "\n🗂️ Largest environments:"
launchpad env:list --format json | jq -r 'sort_by(.size) | reverse | .[0:5] | .[] | "\(.projectName): \(.size)"'

# Oldest environments
echo -e "\n📅 Oldest environments:"
launchpad env:list --format json | jq -r 'sort_by(.created) | .[0:5] | .[] | "\(.projectName): \(.created)"'
```

These examples demonstrate the versatility and power of Launchpad for various development scenarios. Use them as starting points for your own projects and workflows.
