# Frequently Asked Questions (FAQ)

This page answers the most commonly asked questions about Launchpad. If you don't find your answer here, check the [Troubleshooting](./troubleshooting.md) guide or join our [Discord community](https://discord.gg/stacksjs).

## General Questions

### What is Launchpad?

Launchpad is a modern package manager built on top of the pkgx Pantry that provides fast, isolated package management with automatic environment activation. _If needed, it's designed to work alongside existing package managers like Homebrew without conflicts._

### How is Launchpad different from Homebrew?

| Feature | Launchpad | Homebrew |
|---------|-----------|----------|
| **Installation location** | `/usr/local` (or `~/.local`) | `/opt/homebrew` (Apple Silicon) |
| **Environment isolation** | ✅ Project-specific environments | ❌ Global installation |
| **Automatic activation** | ✅ Auto-activates on `cd` | ❌ Manual PATH management |
| **Version management** | ✅ Multiple versions coexist | ❌ One version per package |
| **Conflict with Homebrew** | ❌ No conflicts | N/A |
| **Focus** | Development environments | System tools & GUI apps |

### Can I use Launchpad alongside Homebrew?

**Yes, absolutely!** Launchpad is designed to coexist peacefully with Homebrew:

- **Homebrew** uses `/opt/homebrew` (Apple Silicon) for system tools and GUI apps
- **Launchpad** uses `/usr/local` for development tools and project environments
- **No conflicts** - They use different directories and serve different purposes

```bash
# Both work together
brew install --cask visual-studio-code  # GUI app via Homebrew
launchpad install node@22               # Development tool via Launchpad
```

### Do I need to uninstall other package managers?

**No!** Launchpad works best as a complement to existing tools:

- Keep **Homebrew** for GUI applications and system tools
- Keep **system package managers** (apt, yum, etc.) for OS-level dependencies
- Use **Launchpad** for development environments and project-specific tools

## Installation & Setup

### Where does Launchpad install packages?

Launchpad follows a clear installation hierarchy:

1. **Primary**: `/usr/local` (if writable)
2. **Fallback**: `~/.local` (user-specific)
3. **Custom**: Any path you specify with `--path`

**Important**: Launchpad **never** installs to `/opt/homebrew` to avoid conflicts with Homebrew.

### Why does Launchpad ask for my password?

Launchpad requests sudo privileges only when:

1. **Installing to `/usr/local`** and you don't have write permissions
2. **System-level configuration** is needed
3. **File permissions** need to be set correctly

You can avoid sudo by:
- Installing to user directory: `launchpad install --path ~/.local node@22`
- Fixing `/usr/local` permissions: `sudo chown -R $(whoami) /usr/local`

### How do I completely uninstall Launchpad?

```bash
# Use the built-in uninstall command
launchpad uninstall --force

# Manual cleanup (if needed)
rm -rf ~/.local/share/launchpad/
rm -rf ~/.local/bin/{pkgx,bun}
sed -i '/launchpad/d' ~/.zshrc ~/.bashrc
npm uninstall -g @stacksjs/launchpad
```

### Can I install Launchpad without npm/bun?

Currently, Launchpad is distributed via npm/bun/yarn/pnpm. However, after global installation, Launchpad can bootstrap itself and install its own dependencies (including Bun) independently.

## Environment Management

### How do environment activations work?

When you enter a directory with a `dependencies.yaml` file:

1. **Launchpad generates a hash** based on the project path
2. **Creates an isolated environment** at `~/.local/share/launchpad/envs/{hash}/`
3. **Installs project packages** to the isolated environment
4. **Modifies PATH** to prioritize project binaries
5. **Sets environment variables** from the dependency file
6. **Shows activation message** (customizable)

When you leave the directory, everything is automatically restored.

### Why isn't my environment activating?

**Check shell integration:**
```bash
# Should show function definition
type _pkgx_chpwd_hook

# If not working, add integration
echo 'eval "$(launchpad dev:shellcode)"' >> ~/.zshrc
source ~/.zshrc
```

**Check dependency file:**
```bash
# Verify file exists and syntax is correct
cat dependencies.yaml
launchpad dev:dump --dryrun
```

### Can I disable shell messages?

**Yes!** You have several options:

```bash
# Disable all messages
export LAUNCHPAD_SHOW_ENV_MESSAGES=false

# Customize messages
export LAUNCHPAD_SHELL_ACTIVATION_MESSAGE="🔧 {path}"
export LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE="Done"

# Or configure in launchpad.config.ts
echo 'export default { showShellMessages: false }' > launchpad.config.ts
```

### How do I clean up old environments?

```bash
# Remove environments older than 30 days
launchpad env:clean --older-than 30

# Remove all unused environments
launchpad env:clean --force

# Remove specific environment
launchpad env:remove environment_hash_here
```

### Can multiple projects share the same environment?

Currently, each project gets its own isolated environment based on its path. This ensures complete isolation but means:

- **Different paths** = **Different environments** (even with identical dependencies)
- **Same path** = **Same environment** (environment is reused)

This design prevents conflicts between projects but may use more disk space.

## Package Management

### Why do I need to specify versions?

Launchpad requires explicit versions for predictability and isolation:

```bash
# ✅ Explicit version (recommended)
launchpad install node@22

# ❌ This won't work
launchpad install node
```

This ensures:
- **Reproducible environments** across team members
- **No surprise updates** that break your project
- **Clear dependency tracking**

### How do I find available package versions?

```bash
# Search with pkgx directly
pkgx --search node

# Check what versions are available
pkgx node@  # Shows available versions
```

### Can I install packages not available in pkgx?

**Yes!** Use the smart-install feature:

```bash
# Automatically falls back to system package managers
launchpad smart-install some-package

# Falls back to: Homebrew, apt, yum, pacman, etc.
```

### How do I update packages?

Launchpad uses **immutable packages** - instead of updating, you install new versions:

```bash
# Install new version
launchpad install node@23

# Remove old version if needed
launchpad remove node@22

# Or update dependency file
# dependencies.yaml: node@23 (instead of node@22)
```

### Why can't I install packages globally?

Launchpad encourages **project-specific environments** instead of global installations:

**Instead of global:**
```bash
npm install -g typescript  # Global installation
```

**Use project environments:**
```yaml
# dependencies.yaml
dependencies:
  - node@22
  - typescript@5.0

env:
  NODE_ENV: development
```

This provides better isolation and avoids version conflicts.

**However, if you need global installations**, you can use the `global` flag in your dependencies:

```yaml
# dependencies.yaml - Global installation with Launchpad
dependencies:
  node@22:
    version: 22.1.0
    global: true # Install globally to /usr/local
  typescript@5.0:
    version: 5.0.4
    global: true # Available system-wide

env:
  NODE_ENV: development
```

**Or apply global installation to all packages:**
```yaml
# dependencies.yaml - All packages global
global: true
dependencies:
  - node@22
  - typescript@5.0
  - bun@1.2.3

env:
  NODE_ENV: development
```

**Global vs Project-Local Benefits:**
- **Global installation** (`global: true`): Tools available system-wide, shared across projects
- **Project-local installation** (default): Perfect isolation, no version conflicts between projects
- **Mixed approach**: Core tools global, project-specific tools local

## Configuration & Customization

### Where should I put my configuration file?

Launchpad looks for configuration in this order:

1. `launchpad.config.ts` (current directory)
2. `launchpad.config.js` (current directory)
3. `launchpad.config.json` (current directory)
4. `.launchpadrc` (home directory)
5. `~/.config/launchpad/config.json`

### How do I configure Launchpad for my team?

**Project-specific configuration:**
```typescript
// launchpad.config.ts (commit to version control)
export default {
  verbose: true,
  showShellMessages: true,
  shellActivationMessage: '🚀 {path} environment ready',
  installationPath: '/usr/local' // or ~/.local for user installs
}
```

**Individual preferences:**
```bash
# Personal shell messages (.zshrc)
export LAUNCHPAD_SHELL_ACTIVATION_MESSAGE="💻 Working on {path}"
```

### Can I use Launchpad in CI/CD?

**Absolutely!** Launchpad works great in CI/CD:

```yaml
# GitHub Actions example
- name: Install Launchpad
  run: npm install -g @stacksjs/launchpad

- name: Bootstrap environment
  run: launchpad bootstrap --skip-shell-integration

- name: Install project dependencies
  run: launchpad dev:on
```

## Troubleshooting

### My shell is slow after installing Launchpad

This is usually caused by:

1. **Too many old environments** - Clean them up:
   ```bash
   launchpad env:clean --older-than 7
   ```

2. **Large environments** - Remove unused ones:
   ```bash
   launchpad env:list --verbose  # Find large environments
   launchpad env:remove large_environment_hash
   ```

3. **Shell integration conflicts** - Check for conflicts:
   ```bash
   grep -E "(nvm|rbenv|pyenv)" ~/.zshrc
   ```

### Package installation fails with permission errors

**Fix /usr/local permissions:**
```bash
sudo chown -R $(whoami) /usr/local/bin /usr/local/sbin
```

**Or use user-local installation:**
```bash
launchpad install --path ~/.local node@22
```

### Commands not found after installation

**Check PATH order:**
```bash
echo $PATH  # Launchpad directories should come first
```

**Verify shell integration:**
```bash
source ~/.zshrc  # Reload shell configuration
```

**Manual activation:**
```bash
cd my-project
launchpad dev:on  # Force activation
```

### Environment variables not working

**Check dependency file syntax:**
```yaml
# Correct format
dependencies:
  - node@22

env:
  NODE_ENV: development # ✅ This will be set
  API_URL: 'https://api.example.com'
```

**Test manually:**
```bash
launchpad dev:dump --verbose  # Shows what would be set
```

## Performance & Limits

### How much disk space does Launchpad use?

- **Base installation**: ~50MB (pkgx + Bun)
- **Per environment**: 10MB - 500MB depending on packages
- **Large environments**: Python/Node with many packages can be 1GB+

**Monitor usage:**
```bash
launchpad env:list --verbose  # Shows sizes
du -sh ~/.local/share/launchpad/envs/*
```

### Is there a limit on the number of environments?

No hard limit, but consider:
- **Disk space** - Each environment uses storage
- **Performance** - Many environments can slow shell activation
- **Management** - Use `env:clean` to remove old environments

### How fast is package installation?

Launchpad is significantly faster than traditional package managers:
- **pkgx caching** - Packages are cached after first download
- **Parallel downloads** - Multiple packages install simultaneously
- **No compilation** - Uses pre-built binaries when available

## Migration & Compatibility

### Can I migrate from nvm/rbenv/pyenv?

**Yes!** See our [Migration Guide](./migration.md) for detailed steps. The general process:

1. **Install Launchpad** alongside existing tools
2. **Create `dependencies.yaml`** files for projects
3. **Test each project** with Launchpad environments
4. **Gradually remove** old version managers

### Will this break my existing projects?

**No!** Launchpad is designed for safe migration:
- **Coexists** with existing package managers
- **Project-specific** - only affects directories with `dependencies.yaml`
- **Reversible** - Easy to disable or uninstall

### How do I convert .nvmrc files?

```bash
# Automatically convert
NODE_VERSION=$(cat .nvmrc)
cat > dependencies.yaml << EOF
dependencies:
  - node@${NODE_VERSION}

env:
  NODE_ENV: development
EOF
```

## Advanced Usage

### Can I create custom package templates?

**Yes!** Create reusable templates:

```bash
# Create template directory
mkdir ~/.launchpad-templates

# Create Node.js template
cat > ~/.launchpad-templates/node-webapp.yaml << EOF
dependencies:
  - node@22
  - yarn@1.22
  - typescript@5.0

env:
  NODE_ENV: development
  PORT: 3000
EOF

# Use template
cp ~/.launchpad-templates/node-webapp.yaml ./dependencies.yaml
```

### Can I use Launchpad in Docker?

**Yes!** Launchpad works in containers:

```dockerfile
FROM ubuntu:22.04

# Install Launchpad
RUN curl -fsSL https://bun.sh/install | bash
RUN /root/.bun/bin/bun add -g @stacksjs/launchpad

# Bootstrap and install dependencies
COPY dependencies.yaml .
RUN launchpad bootstrap --skip-shell-integration
RUN launchpad dev:on
```

### How do I script with Launchpad?

**Environment activation in scripts:**
```bash
#!/bin/bash
cd my-project

# Activate environment
eval "$(launchpad dev:shellcode)"
source <(launchpad dev:script)

# Now use project-specific tools
node --version
python --version
```

## Getting Help

### Where can I get support?

- **Documentation**: [https://launchpad.sh](https://launchpad.sh)
- **GitHub Discussions**: [Ask questions](https://github.com/stacksjs/launchpad/discussions)
- **Discord**: [Real-time chat](https://discord.gg/stacksjs)
- **Issues**: [Report bugs](https://github.com/stacksjs/launchpad/issues)

### How do I report a bug?

When reporting issues, include:

1. **System information**: `launchpad --version`, OS, shell
2. **Error messages**: Full error output
3. **Steps to reproduce**: What you did before the error
4. **Configuration**: Your `launchpad.config.ts` (sanitized)
5. **Environment**: Output of `launchpad env:list`

### How can I contribute?

- **Documentation**: Improve guides and examples
- **Code**: Submit pull requests
- **Community**: Help others in Discord/Discussions
- **Testing**: Report bugs and edge cases
- **Feedback**: Share your use cases and feature requests

### Is Launchpad open source?

**Yes!** Launchpad is open source under the MIT license:
- **GitHub**: [https://github.com/stacksjs/launchpad](https://github.com/stacksjs/launchpad)
- **License**: [MIT License](https://github.com/stacksjs/launchpad/blob/main/LICENSE.md)
- **Contributing**: [Contribution Guidelines](https://github.com/stacksjs/launchpad/blob/main/https://github.com/stacksjs/contributing)
