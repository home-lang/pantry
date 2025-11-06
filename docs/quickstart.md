# Quick Start

This guide will help you install, configure, and start using pantry right away.

## 1. Install pantry

Choose your preferred package manager:

```bash
# Recommended: Bun (fastest)
bun add -g ts-pantry

# Or use npm
npm install -g ts-pantry

# Or use yarn
yarn global add ts-pantry

# Or use pnpm
pnpm add -g ts-pantry
```

## 2. Bootstrap Your Environment

Let pantry set up everything you need automatically:

```bash
# One command to rule them all
pantry bootstrap

# See what's happening (recommended for first run)
pantry bootstrap --verbose
```

This command will:

- ✅ Install Bun (JavaScript runtime)
- ✅ Configure your PATH automatically
- ✅ Set up shell integration for automatic environment activation

## 3. (Optional) Set Up Shell Integration

Shell integration is installed automatically when you run `pantry bootstrap` (unless you pass `--skip-shell-integration`). If you skipped bootstrap or want to set it up manually, run:

```bash
# Add to your shell configuration (zsh)
echo 'eval "$(pantry dev:shellcode)"' >> ~/.zshrc
source ~/.zshrc

# Or for bash users
echo 'eval "$(pantry dev:shellcode)"' >> ~/.bashrc
source ~/.bashrc
```

## 4. Install Your First Package

```bash
# Install Node.js
pantry install node@22

# Verify it works
node --version
```

## 5. Create Your First Project

```bash
# Create a new project
mkdir my-first-pantry-project
cd my-first-pantry-project

# Create a dependency file
cat > dependencies.yaml << EOF
dependencies:
  - node@22
  - typescript@5.0

env:
  NODE_ENV: development
  PROJECT_NAME: my-first-project
EOF

# Environment automatically activates!
# You should see: ✅ Environment activated for /path/to/my-first-pantry-project
```

## 6. Verify Everything Works

```bash
# Check that packages are available
node --version
tsc --version

# Check environment variables
echo $NODE_ENV          # Should show: development
echo $PROJECT_NAME      # Should show: my-first-project

# List installed packages
pantry list
```

## What Just Happened?

🎉 **Congratulations!** You've just:

1. **Installed pantry** - A modern package manager that works alongside your existing tools
2. **Bootstrapped your system** - Set up pkgx, Bun, and (optionally) shell integration
3. **Created your first environment** - Project-specific isolation with automatic activation
4. **Installed packages** - Node.js and TypeScript are now available in your project

## Next Steps

Now that you have pantry running, here's what you can explore:

### Explore More Commands

```bash
# Install multiple packages at once
pantry install python@3.12 go@1.21

# Remove packages
pantry remove python

# List all environments
pantry env:list

# Clean up old environments
pantry env:clean --dry-run
```

### Create More Projects

```bash
# Python project
mkdir python-project && cd python-project
cat > dependencies.yaml << EOF
dependencies:
  - python@3.12
  - pip

env:
  PYTHONPATH: ./src
EOF

# Full-stack project
mkdir fullstack-project && cd fullstack-project
cat > dependencies.yaml << EOF
dependencies:
  - node@22
  - python@3.12
  - postgresql@15

env:
  NODE_ENV: development
  DATABASE_URL: postgresql://localhost:5432/myapp
EOF
```

### Customize Your Experience

```bash
# Customize shell messages
export pantry_SHELL_ACTIVATION_MESSAGE="🚀 Ready to code: {path}"
export pantry_SHELL_DEACTIVATION_MESSAGE="👋 See you later!"

# Or disable messages entirely
export pantry_SHOW_ENV_MESSAGES=false
```

## Common Commands Reference

| Command | Description |
|---------|-------------|
| `pantry install <pkg>` | Install a package |
| `pantry remove <pkg>` | Remove a package |
| `pantry list` | List installed packages |
| `pantry env:list` | List all environments |
| `pantry env:clean` | Clean up old environments |
| `pantry bootstrap` | Set up everything |
| `pantry help` | Show help |

## Troubleshooting

### Environment Not Activating?

1. Make sure shell integration is set up:

   ```bash
   grep "pantry dev:shellcode" ~/.zshrc
   ```

2. Reload your shell:

   ```bash
   source ~/.zshrc
   ```

3. Check for dependency files:

   ```bash
   ls -la dependencies.yaml
   ```

### Package Not Found?

1. Check the exact package name:

   ```bash
   pantry list
   ```

2. Try verbose installation:

   ```bash
   pantry install --verbose node@22
   ```

### Need Help?

```bash
# Get help for any command
pantry help
pantry install --help

# Check your configuration
pantry --version
```

## Learn More

Ready to dive deeper? Check out these guides:

- **[Basic Usage](./usage.md)** - Comprehensive command reference
- **[Configuration](./config.md)** - Customize pantry to your needs
- **[Examples](./examples.md)** - Real-world usage examples
- **[Environment Management](./features/environment-management.md)** - Advanced environment features

## What Makes pantry Different?

- **🚀 Fast** - No waiting around for package installations
- **🔒 Isolated** - Each project gets its own environment
- **🤝 Coexistent** - Works alongside Homebrew and other package managers
- **🎯 Automatic** - Environment activation happens seamlessly
- **🛠️ Flexible** - Install to `/usr/local`, `~/.local`, or custom paths
- **💬 Customizable** - Shell messages, paths, and behavior

Welcome to modern package management! 🎉
