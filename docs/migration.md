# Migration Guide

This guide helps you migrate from other package managers to Launchpad, whether you want to replace them entirely or use Launchpad alongside your existing tools.

## Migration Philosophy

Launchpad is designed to **coexist peacefully** with other package managers rather than replace them entirely. This means you can:

- Keep using Homebrew for GUI applications and system tools
- Use Launchpad for development environments and project-specific tools
- Gradually migrate projects at your own pace
- Maintain both systems without conflicts

## From Homebrew

### Understanding the Difference

**Homebrew** installs to `/opt/homebrew` (Apple Silicon) or `/usr/local` (Intel)
**Launchpad** installs to `/usr/local` by default (or `~/.local` for user installs)

On Apple Silicon Macs, this means **zero conflicts** since they use different directories.

### Audit Your Current Setup

```bash
# List all Homebrew packages
brew list > homebrew-packages.txt

# Categorize your packages
echo "=== GUI Applications ===" >> migration-plan.txt
brew list --cask >> migration-plan.txt

echo "=== Development Tools ===" >> migration-plan.txt
brew list | grep -E "(node|python|go|rust|java)" >> migration-plan.txt

echo "=== System Tools ===" >> migration-plan.txt
brew list | grep -E "(git|curl|wget|jq)" >> migration-plan.txt
```

### Migration Strategy

#### Option 1: Parallel Installation (Recommended)

Keep Homebrew for some packages, use Launchpad for others:

```bash
# Install Launchpad
bun add -g @stacksjs/launchpad
launchpad bootstrap

# Keep using Homebrew for GUI apps
brew install --cask visual-studio-code
brew install --cask docker

# Use Launchpad for development tools
launchpad install node@22 python@3.12 go@1.21

# Both coexist peacefully
brew list           # Homebrew packages
launchpad list      # Launchpad packages
```

#### Option 2: Project-by-Project Migration

Gradually migrate projects to use Launchpad environments:

```bash
# Start with a new project
mkdir new-project && cd new-project
cat > dependencies.yaml << EOF
dependencies:
  - node@22
  - yarn@1.22

env:
  NODE_ENV: development
EOF

# Environment automatically activates
# ✅ Environment activated for /path/to/new-project

# Old projects continue using Homebrew versions
cd ../old-project
node --version  # Uses Homebrew version
```

#### Option 3: Complete Migration

Replace Homebrew development tools with Launchpad:

```bash
# 1. Install Launchpad
bun add -g @stacksjs/launchpad
launchpad bootstrap

# 2. Install development tools via Launchpad
launchpad install node@22 python@3.12 go@1.21 rust

# 3. Update your PATH to prioritize Launchpad
# (Launchpad bootstrap already does this)

# 4. Verify new tools are used
which node    # Should point to Launchpad installation
which python  # Should point to Launchpad installation

# 5. Remove Homebrew development tools (optional)
brew uninstall node python go rust
```

### Command Mapping

| Homebrew | Launchpad | Notes |
|----------|-----------|-------|
| `brew install node` | `launchpad install node` or `launchpad install node@22` | Versions are optional; pin them when you need determinism |
| `brew uninstall node` | `launchpad remove node` | Launchpad removes all versions by default |
| `brew list` | `launchpad list` | Both show installed packages |
| `brew upgrade` | N/A | Launchpad uses immutable packages |
| `brew doctor` | `launchpad --version` | Basic health check |

## From Node Version Manager (nvm)

### Current State Analysis

```bash
# Check current Node versions
nvm list

# Check current default
nvm current

# See which projects use which versions
find . -name ".nvmrc" -exec echo {} \; -exec cat {} \; -exec echo \;
```

### Migration Steps

1. **Install Launchpad:**
   ```bash
   bun add -g @stacksjs/launchpad
   launchpad bootstrap
   ```

2. **Create project-specific environments:**
   ```bash
   # For each project, replace .nvmrc with dependencies.yaml
   cd my-project

   # If you have .nvmrc
   NODE_VERSION=$(cat .nvmrc)
   cat > dependencies.yaml << EOF
   dependencies:
     - node@${NODE_VERSION}
     - yarn@1.22  # or npm, depending on preference

   env:
     NODE_ENV: development
   EOF
   ```

3. **Set up shell integration:**
   ```bash
   echo 'eval "$(launchpad dev:shellcode)"' >> ~/.zshrc
   source ~/.zshrc
   ```

4. **Test the migration:**
   ```bash
   cd my-project  # Should automatically activate environment
   node --version # Should show the version from dependencies.yaml
   ```

5. **Gradually remove nvm (optional):**
   ```bash
   # After verifying all projects work
   nvm deactivate
   # Remove nvm lines from ~/.zshrc
   # Uninstall nvm
   ```

### Benefits Over nvm

- **Automatic activation** - No need to run `nvm use`
- **Multiple runtimes** - Include Python, Go, etc. in the same environment
- **Environment variables** - Set project-specific env vars
- **Isolation** - Each project gets its own install directory

## From Python Virtual Environments

### From virtualenv/venv

```bash
# Current workflow
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Launchpad workflow
cat > dependencies.yaml << EOF
dependencies:
  - python@3.12
  - pip

env:
  PYTHONPATH: ./src
  VIRTUAL_ENV: ./.venv  # For compatibility
EOF

# Environment automatically activates when entering directory
```

### From Poetry

```bash
# Current workflow
poetry install
poetry shell

# Launchpad workflow
cat > dependencies.yaml << EOF
dependencies:
  - python@3.12
  - poetry@1.5

env:
  PYTHONPATH: ./src
EOF

# Then use poetry as normal within the environment
poetry install
# No need for poetry shell - environment is already active
```

### From Conda

```bash
# Current workflow
conda create -n myproject python=3.12
conda activate myproject
conda install numpy pandas

# Launchpad workflow
cat > dependencies.yaml << EOF
dependencies:
  - python@3.12
  - pip

env:
  PYTHONPATH: ./src
  PROJECT_NAME: myproject
EOF

# Install packages with pip instead of conda
pip install numpy pandas
```

## From rbenv/rvm (Ruby)

### From rbenv

```bash
# Current workflow
rbenv install 3.1.0
rbenv local 3.1.0
bundle install

# Launchpad workflow
cat > dependencies.yaml << EOF
dependencies:
  - ruby@3.1.0

env:
  BUNDLE_PATH: ./vendor/bundle
EOF

bundle install  # Uses Launchpad's Ruby version
```

### From rvm

```bash
# Current workflow
rvm install 3.1.0
rvm use 3.1.0
bundle install

# Launchpad workflow
cat > dependencies.yaml << EOF
dependencies:
  - ruby@3.1.0

env:
  GEM_HOME: ./.gems
  GEM_PATH: ./.gems
EOF
```

## From Docker Development Environments

### Simple Replacement

```dockerfile
# Current Dockerfile for development
FROM node:22
WORKDIR /app
COPY package.json .
RUN npm install
CMD ["npm", "start"]
```

```yaml
# Launchpad dependencies.yaml
dependencies:
  - node@22
  - yarn@1.22

env:
  NODE_ENV: development
  PORT: 3000
```

### Complex Multi-Runtime Setup

```dockerfile
# Current complex Dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y \
    nodejs npm python3 python3-pip postgresql-client
```

```yaml
# Launchpad equivalent
dependencies:
  - node@22
  - python@3.12
  - postgresql@15

env:
  NODE_ENV: development
  PYTHON_ENV: development
  DATABASE_URL: postgresql://localhost:5432/myapp
```

## Migration Best Practices

### 1. Start Small

Begin with new projects or non-critical environments:

```bash
# Create a test project to verify Launchpad works
mkdir test-launchpad && cd test-launchpad
cat > dependencies.yaml << EOF
dependencies:
  - node@22

env:
  TEST_VAR: hello-launchpad
EOF

# Test that it works
echo $TEST_VAR
node --version
```

### 2. Migrate Gradually

Don't migrate everything at once:

```bash
# Week 1: Install Launchpad, test basic functionality
# Week 2: Migrate one small project
# Week 3: Migrate more projects
# Week 4: Consider removing old tools
```

### 3. Document Your Configuration

Keep track of your Launchpad configurations:

```bash
# Create a central template repository
mkdir ~/.launchpad-templates
cp successful-project/dependencies.yaml ~/.launchpad-templates/node-web-app.yaml
```

### 4. Verify Before Cleanup

Always verify Launchpad is working before removing old tools:

```bash
# Test checklist
cd my-project
echo "Node version: $(node --version)"
echo "Python version: $(python --version)"
echo "Environment: $LAUNCHPAD_ENV_HASH"
npm test  # or your test command
```

## Troubleshooting Migration Issues

### PATH Conflicts

```bash
# Check PATH order
echo $PATH

# Ensure Launchpad directories come first
# /usr/local/bin should appear before /opt/homebrew/bin
```

### Shell Integration Conflicts

```bash
# Check for conflicts with other version managers
grep -E "(nvm|rbenv|pyenv|rvm)" ~/.zshrc ~/.bashrc

# Temporarily disable other tools to test Launchpad
# Comment out conflicting lines and reload shell
```

### Package Compatibility

```bash
# Some packages might not be available
# Check availability first
launchpad search package-name

# Get detailed package information
launchpad info package-name
```

## Rollback Plan

If you need to revert:

1. **Keep old package managers during transition**
2. **Document your original configuration**
3. **Test thoroughly before cleanup**
4. **Use Launchpad's uninstall command**

```bash
# Complete rollback
launchpad uninstall --force

# Remove shell integration
sed -i '/launchpad dev:shellcode/d' ~/.zshrc

# Re-enable old tools
# Uncomment nvm, rbenv, etc. in shell config
```

## Migration Success Stories

### Example: Node.js Project Migration

**Before (nvm):**
```bash
# .nvmrc
v22.0.0

# Terminal commands every time
cd project
nvm use
npm install
npm start
```

**After (Launchpad):**
```yaml
# dependencies.yaml
dependencies:
  - node@22.0.0
  - yarn@1.22

env:
  NODE_ENV: development
  API_URL: http://localhost:3001
```

**Benefits achieved:**
- ✅ Automatic environment activation
- ✅ Included yarn in project environment
- ✅ Project-specific environment variables
- ✅ No manual `nvm use` commands

### Example: Python Data Science Migration

**Before (Conda):**
```bash
conda create -n data-science python=3.12 numpy pandas jupyter
conda activate data-science
```

**After (Launchpad):**
```yaml
# dependencies.yaml
dependencies:
  - python@3.12
  - pip

env:
  PYTHONPATH: ./src
  JUPYTER_CONFIG_DIR: ./.jupyter
  DATA_DIR: ./data
```

```bash
# Additional setup
pip install numpy pandas jupyter
```

**Benefits achieved:**
- ✅ Automatic environment activation
- ✅ Project-specific Python paths
- ✅ Custom environment variables
- ✅ Easier to version control

## Getting Help During Migration

- **GitHub Discussions**: [Ask migration questions](https://github.com/stacksjs/launchpad/discussions)
- **Discord**: [Real-time help](https://discord.gg/stacksjs)
- **Examples**: Check the [Examples](./examples.md) page for migration patterns
- **Troubleshooting**: See [Troubleshooting](./troubleshooting.md) for common issues

Remember: Migration should be **gradual** and **reversible**. Take your time and verify each step works before proceeding to the next.
