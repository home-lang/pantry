# Frequently Asked Questions (FAQ)

This page answers the most commonly asked questions about pantry. If you don't find your answer here, check the [Troubleshooting](./troubleshooting.md) guide or join our [Discord community](https://discord.gg/stacksjs).

## General Questions

### What is pantry

pantry is a modern package manager built on top of the pkgx Pantry that provides fast, isolated package management with automatic environment activation. _If needed, it's designed to work alongside existing package managers like Homebrew without conflicts._

### How is pantry different from Homebrew

| Feature | pantry | Homebrew |
|---------|-----------|----------|
| **Installation location** | `/usr/local` (or `~/.local`) | `/opt/homebrew` (Apple Silicon) |
| **Environment isolation** | ✅ Project-specific environments | ❌ Global installation |
| **Automatic activation** | ✅ Auto-activates on `cd` | ❌ Manual PATH management |
| **Version management** | ✅ Multiple versions coexist | ❌ One version per package |
| **Conflict with Homebrew** | ❌ No conflicts | N/A |
| **Focus** | Development environments | System tools & GUI apps |

### Can I use pantry alongside Homebrew

**Yes, absolutely!** pantry is designed to coexist peacefully with Homebrew:

- **Homebrew** uses `/opt/homebrew` (Apple Silicon) for system tools and GUI apps
- **pantry** uses `/usr/local` for development tools and project environments
- **No conflicts** - They use different directories and serve different purposes

```bash
# Both work together
brew install --cask visual-studio-code  # GUI app via Homebrew
pantry install node@22               # Development tool via pantry
```

### Do I need to uninstall other package managers

**No!** pantry works best as a complement to existing tools:

- Keep **Homebrew** for GUI applications and system tools
- Keep **system package managers** (apt, yum, etc.) for OS-level dependencies
- Use **pantry** for development environments and project-specific tools

## Installation & Setup

### Where does pantry install packages

pantry follows a clear installation hierarchy:

1. **Primary**: `/usr/local` (if writable)
2. **Fallback**: `~/.local` (user-specific)
3. **Custom**: Any path you specify with `--path`

**Important**: pantry**never** installs to `/opt/homebrew` to avoid conflicts with Homebrew.

### Why does pantry ask for my password

pantry requests sudo privileges only when:

1. **Installing to `/usr/local`** and you don't have write permissions
2. **System-level configuration** is needed
3. **File permissions** need to be set correctly

You can avoid sudo by:

- Installing to user directory: `pantry install --path ~/.local node@22`
- Fixing `/usr/local` permissions: `sudo chown -R $(whoami) /usr/local`

### How do I completely uninstall pantry

```bash
# Use the built-in uninstall command
pantry uninstall --force

# Manual cleanup (if needed)
rm -rf ~/.local/share/pantry/
rm -rf ~/.local/bin/{pkgx,bun}
sed -i '/pantry/d' ~/.zshrc ~/.bashrc
npm uninstall -g ts-pantry
```

### Can I install pantry without npm/bun

Currently, pantry is distributed via npm/bun/yarn/pnpm. However, after global installation, pantry can bootstrap itself and install its own dependencies (including Bun) independently.

## Environment Management

### How do environment activations work

When you enter a directory with a dependency file (e.g. `deps.yaml`, `dependencies.yaml`, `pkgx.yml`, `pantry.yml`, `package.json`, `pyproject.toml`):

1. pantry generates a hash based on the project path
2. pantry computes a dependency fingerprint (md5 of the dependency file content)
3. It creates/selects an environment at `~/.local/share/pantry/envs/<project>_<hash>-d<dep_hash>`
4. Installs project packages into that isolated environment (if needed)
5. Modifies PATH to prioritize project binaries
6. Sets environment variables from the dependency file
7. Shows an activation message (customizable)

When you leave the directory, everything is automatically restored.

### Why isn't my environment activating

**Check shell integration:**

```bash
# Should show function definition
type _pkgx_chpwd_hook

# If not working, add integration
echo 'eval "$(pantry dev:shellcode)"' >> ~/.zshrc
source ~/.zshrc
```

**Check dependency file:**

```bash
# Verify file exists and syntax is correct
cat dependencies.yaml
pantry dev:dump --dryrun
```

### Why didn't my tool version switch after I changed deps.yaml

When you cd into a project, pantry now derives the environment directory from:

- a hash of the project path, and
- a dependency fingerprint (md5 of the dependency file content),

producing a path like:

```
~/.local/share/pantry/envs/<project>_<hash>-d<dep_hash>
```

Changing versions in `deps.yaml` (or `dependencies.yml`, `pkgx.yml`, `pantry.yml`, `package.json`, `pyproject.toml`, etc.) changes the fingerprint, so a new env dir is selected and the correct versions are installed/activated automatically.

Recognized dependency files include:

- `deps.yaml` / `deps.yml`
- `dependencies.yaml` / `dependencies.yml`
- `pkgx.yaml` / `pkgx.yml`
- `pantry.yaml` / `pantry.yml`
- `package.json`
- `pyproject.toml`

To see this live, enable verbose logging and cd into the project:

```bash
export PANTRY_VERBOSE=true
cd my-project
```

You’ll see a line like:

```
🔍 Env target: env_dir=… dep_file=… dep_hash=…
```

If the env didn’t change, confirm the `dep_file` is the one you edited and that `dep_hash` differs from the previous run. You can also inspect cache decisions:

```
🔍 Cache check: dep=… dep_mtime=… cache_mtime=… fp_match=yes|no
🔁 Cache invalid: dependency newer than cache
🔁 Cache invalid: fingerprint mismatch
```

Tip: if you previously activated a project and then edited dependencies, simply `cd .. && cd my-project` to pick up the new env.

### Can I disable shell messages

**Yes!** You have several options:

```bash
# Disable all messages
export pantry_SHOW_ENV_MESSAGES=false

# Customize messages
export pantry_SHELL_ACTIVATION_MESSAGE="🔧 {path}"
export pantry_SHELL_DEACTIVATION_MESSAGE="Done"

# Or configure in pantry.config.ts
echo 'export default { showShellMessages: false }' > pantry.config.ts
```

### How do I clean up old environments

```bash
# Remove environments older than 30 days
pantry env:clean --older-than 30

# Remove all unused environments
pantry env:clean --force

# Remove specific environment
pantry env:remove environment_hash_here
```

### How do I safely clean up without removing essential tools

Use the `--keep-global` option to preserve global dependencies during cleanup:

```bash
# Safe cleanup that preserves global dependencies
pantry clean --keep-global --force

# Preview what would be preserved
pantry clean --keep-global --dry-run

# Combine with other options
pantry clean --keep-global --keep-cache --force
```

**What gets preserved?**

- Any package marked with `global: true` in dependency files

**Example global dependency file** (`~/.dotfiles/deps.yaml`):

```yaml
global: true
dependencies:
  bun.sh: ^1.2.16
  gnu.org/bash: ^5.2.37
  gnu.org/grep: ^3.12.0
  starship.rs: ^1.23.0
  cli.github.com: ^2.73.0
```

**Why use `--keep-global`?**

- Prevents accidental removal of essential tools
- Avoids breaking your development environment
- Maintains system stability during cleanup
- Preserves tools you rely on globally across projects

### Can multiple projects share the same environment

Currently, each project gets its own isolated environment based on its path. This ensures complete isolation but means:

- **Different paths**=**Different environments** (even with identical dependencies)
- **Same path**=**Same environment** (environment is reused)

This design prevents conflicts between projects but may use more disk space.

## Package Management

### Why do I need to specify versions

pantry requires explicit versions for predictability and isolation:

```bash
# ✅ Explicit version (recommended)
pantry install node@22

# ❌ This won't work
pantry install node
```

This ensures:

- **Reproducible environments** across team members
- **No surprise updates** that break your project
- **Clear dependency tracking**

### How do I find available package versions

```bash
# Search with pantry's built-in search
pantry search node

# Get detailed package information including versions
pantry info node --versions
```

### Can I install packages not available in pkgx

Currently, pantry uses the pkgx registry through ts-pkgx. If a package isn't available, you can:

```bash
# Check what packages are available
pantry search package-name

# Or install manually with your system package manager
brew install some-package  # macOS
apt install some-package   # Ubuntu/Debian
```

### How do I update packages

pantry uses **immutable packages** - instead of updating, you install new versions:

```bash
# Install new version
pantry install node@23

# Remove old version if needed
pantry remove node@22

# Or update dependency file
# dependencies.yaml: node@23 (instead of node@22)
```

### Why can't I install packages globally

pantry encourages **project-specific environments** instead of global installations:

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
# dependencies.yaml - Global installation with pantry
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

### Where should I put my configuration file

pantry looks for configuration in this order:

1. `pantry.config.ts` (current directory)
2. `pantry.config.js` (current directory)
3. `pantry.config.json` (current directory)
4. `.pantryrc` (home directory)
5. `~/.config/pantry/config.json`

### How do I configure pantry for my team

**Project-specific configuration:**

```typescript
// pantry.config.ts (commit to version control)
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
export pantry_SHELL_ACTIVATION_MESSAGE="💻 Working on {path}"
```

### Can I use pantry in CI/CD

**Absolutely!** pantry works great in CI/CD:

```yaml
# GitHub Actions example

- name: Install pantry

  run: npm install -g ts-pantry

- name: Bootstrap environment

  run: pantry bootstrap --skip-shell-integration

- name: Install project dependencies

  run: pantry dev:on
```

## Troubleshooting

### My shell is slow after installing pantry

This is usually caused by:

1. **Too many old environments** - Clean them up:

   ```bash
   pantry env:clean --older-than 7
   ```

2. **Large environments** - Remove unused ones:

   ```bash
   pantry env:list --verbose  # Find large environments
   pantry env:remove large_environment_hash
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
pantry install --path ~/.local node@22
```

### Commands not found after installation

**Check PATH order:**

```bash
echo $PATH  # pantry directories should come first
```

**Verify shell integration:**

```bash
source ~/.zshrc  # Reload shell configuration
```

**Manual activation:**

```bash
cd my-project
pantry dev:on  # Force activation
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
pantry dev:dump --verbose  # Shows what would be set
```

## Performance & Limits

### How much disk space does pantry use

- **Base installation**: ~50MB (pkgx + Bun)
- **Per environment**: 10MB - 500MB depending on packages
- **Large environments**: Python/Node with many packages can be 1GB+

**Monitor usage:**

```bash
pantry env:list --verbose  # Shows sizes
du -sh ~/.local/share/pantry/envs/*
```

### Is there a limit on the number of environments

No hard limit, but consider:

- **Disk space** - Each environment uses storage
- **Performance** - Many environments can slow shell activation
- **Management** - Use `env:clean` to remove old environments

### How fast is package installation

pantry is significantly faster than traditional package managers:

- **pkgx caching** - Packages are cached after first download
- **Parallel downloads** - Multiple packages install simultaneously
- **No compilation** - Uses pre-built binaries when available

## Migration & Compatibility

### Can I migrate from nvm/rbenv/pyenv

**Yes!** See our [Migration Guide](./migration.md) for detailed steps. The general process:

1. **Install pantry** alongside existing tools
2. **Create `dependencies.yaml`** files for projects
3. **Test each project** with pantry environments
4. **Gradually remove** old version managers

### Will this break my existing projects

**No!** pantry is designed for safe migration:

- **Coexists** with existing package managers
- **Project-specific** - only affects directories with `dependencies.yaml`
- **Reversible** - Easy to disable or uninstall

### How do I convert .nvmrc files

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

### Does pantry work with Starship prompt

**Yes!** pantry is fully compatible with Starship. However, you might see timeout warnings when Starship tries to detect tool versions:

```
[WARN] - (starship::utils): Executing command "/path/to/bin/bun" timed out.
```

**Quick fix** - Increase Starship's timeout in `~/.config/starship.toml`:

```toml
# Add this at the top of your starship.toml
command_timeout = 5000

# Rest of your configuration
[git_branch]
symbol = "🌱 "

[bun]
symbol = "🐰 "
```

This gives Starship 5 seconds (instead of the default) to execute commands, which eliminates timeout warnings while keeping your prompt responsive.

**Why this happens:** When you enter a pantry-managed project, the environment activation process temporarily affects how quickly binaries respond, causing Starship's version detection to timeout with its default settings.

## Advanced Usage

### Can I create custom package templates

**Yes!** Create reusable templates:

```bash
# Create template directory
mkdir ~/.pantry-templates

# Create Node.js template
cat > ~/.pantry-templates/node-webapp.yaml << EOF
dependencies:

  - node@22
  - yarn@1.22
  - typescript@5.0

env:
  NODE_ENV: development
  PORT: 3000
EOF

# Use template
cp ~/.pantry-templates/node-webapp.yaml ./dependencies.yaml
```

### Can I use pantry in Docker

**Yes!** pantry works in containers:

```dockerfile
FROM ubuntu:22.04

# Install pantry
RUN curl -fsSL https://bun.sh/install | bash
RUN /root/.bun/bin/bun add -g ts-pantry

# Bootstrap and install dependencies
COPY dependencies.yaml .
RUN pantry bootstrap --skip-shell-integration
RUN pantry dev:on
```

### How do I script with pantry

**Environment activation in scripts:**

```bash
# !/bin/bash
cd my-project

# Activate environment
eval "$(pantry dev:shellcode)"
source <(pantry dev:script)

# Now use project-specific tools
node --version
python --version
```

## Getting Help

### Where can I get support

- **Documentation**: [<https://pantry.s>h](https://pantry.sh)
- **GitHub Discussions**: [Ask questions](https://github.com/stacksjs/pantry/discussions)
- **Discord**: [Real-time chat](https://discord.gg/stacksjs)
- **Issues**: [Report bugs](https://github.com/stacksjs/pantry/issues)

### How do I report a bug

When reporting issues, include:

1. **System information**: `pantry --version`, OS, shell
2. **Error messages**: Full error output
3. **Steps to reproduce**: What you did before the error
4. **Configuration**: Your `pantry.config.ts` (sanitized)
5. **Environment**: Output of `pantry env:list`

### How can I contribute

- **Documentation**: Improve guides and examples
- **Code**: Submit pull requests
- **Community**: Help others in Discord/Discussions
- **Testing**: Report bugs and edge cases
- **Feedback**: Share your use cases and feature requests

### Is pantry open source

**Yes!** pantry is open source under the MIT license:

- **GitHub**: [<https://github.com/stacksjs/pantr>y](https://github.com/stacksjs/pantry)
- **License**: [MIT License](https://github.com/stacksjs/pantry/blob/main/LICENSE.md)
- **Contributing**: [Contribution Guidelines](https://github.com/stacksjs/pantry/blob/main/<https://github.com/stacksjs/contributin>g)
