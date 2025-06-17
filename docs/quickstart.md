# Quick Start

Get up and running with Launchpad in under 5 minutes! This guide will help you install, configure, and start using Launchpad right away.

## 1. Install Launchpad

Choose your preferred package manager:

```bash
# Recommended: Bun (fastest)
bun add -g @stacksjs/launchpad

# Or use npm
npm install -g @stacksjs/launchpad

# Or use yarn
yarn global add @stacksjs/launchpad

# Or use pnpm
pnpm add -g @stacksjs/launchpad
```

## 2. Bootstrap Your Environment

Let Launchpad set up everything you need automatically:

```bash
# One command to rule them all
launchpad bootstrap

# See what's happening (recommended for first run)
launchpad bootstrap --verbose
```

This command will:

- ✅ Install Bun (JavaScript runtime)
- ✅ Configure your PATH automatically
- ✅ Set up shell integration for automatic environment activation

## 3. Set Up Shell Integration

Enable automatic environment activation for project directories:

```bash
# Add to your shell configuration (zsh)
echo 'eval "$(launchpad dev:shellcode)"' >> ~/.zshrc
source ~/.zshrc

# Or for bash users
echo 'eval "$(launchpad dev:shellcode)"' >> ~/.bashrc
source ~/.bashrc
```

## 4. Install Your First Package

```bash
# Install Node.js
launchpad install node@22

# Verify it works
node --version
```

## 5. Create Your First Project

```bash
# Create a new project
mkdir my-first-launchpad-project
cd my-first-launchpad-project

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
# You should see: ✅ Environment activated for /path/to/my-first-launchpad-project
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
launchpad list
```

## What Just Happened?

🎉 **Congratulations!** You've just:

1. **Installed Launchpad** - A modern package manager that works alongside your existing tools
2. **Bootstrapped your system** - Set up pkgx, Bun, and shell integration
3. **Created your first environment** - Project-specific isolation with automatic activation
4. **Installed packages** - Node.js and TypeScript are now available in your project

## Next Steps

Now that you have Launchpad running, here's what you can explore:

### Explore More Commands

```bash
# Install multiple packages at once
launchpad install python@3.12 go@1.21

# Remove packages
launchpad remove python

# List all environments
launchpad env:list

# Clean up old environments
launchpad env:clean --dry-run
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
export LAUNCHPAD_SHELL_ACTIVATION_MESSAGE="🚀 Ready to code: {path}"
export LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE="👋 See you later!"

# Or disable messages entirely
export LAUNCHPAD_SHOW_ENV_MESSAGES=false
```

## Common Commands Reference

| Command | Description |
|---------|-------------|
| `launchpad install <pkg>` | Install a package |
| `launchpad remove <pkg>` | Remove a package |
| `launchpad list` | List installed packages |
| `launchpad env:list` | List all environments |
| `launchpad env:clean` | Clean up old environments |
| `launchpad bootstrap` | Set up everything |
| `launchpad help` | Show help |

## Troubleshooting

### Environment Not Activating?

1. Make sure shell integration is set up:
   ```bash
   grep "launchpad dev:shellcode" ~/.zshrc
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
   launchpad list
   ```

2. Try verbose installation:
   ```bash
   launchpad install --verbose node@22
   ```

### Need Help?

```bash
# Get help for any command
launchpad help
launchpad install --help

# Check your configuration
launchpad --version
```

## Learn More

Ready to dive deeper? Check out these guides:

- **[Basic Usage](./usage.md)** - Comprehensive command reference
- **[Configuration](./config.md)** - Customize Launchpad to your needs
- **[Examples](./examples.md)** - Real-world usage examples
- **[Environment Management](./features/environment-management.md)** - Advanced environment features

## What Makes Launchpad Different?

- **🚀 Fast** - No waiting around for package installations
- **🔒 Isolated** - Each project gets its own environment
- **🤝 Coexistent** - Works alongside Homebrew and other package managers
- **🎯 Automatic** - Environment activation happens seamlessly
- **🛠️ Flexible** - Install to `/usr/local`, `~/.local`, or custom paths
- **💬 Customizable** - Shell messages, paths, and behavior

Welcome to modern package management! 🎉
