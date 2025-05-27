# Shim Creation

Launchpad provides a powerful shim creation system that makes package executables available across your system without modifying the global environment.

## What are Shims?

Shims are lightweight executable scripts that point to the actual binaries. When you run a shim, it transparently forwards the command to the actual binary, along with any arguments you provide.

Benefits of using shims:
- Run commands from anywhere without modifying your PATH for each package
- Use specific versions of tools without conflicts
- Easy clean-up and management

## Creating Shims

To create shims for a package:

```bash
# Create shims for all executables in a package
launchpad shim node

# Create shims for multiple packages
launchpad shim python go typescript
```

## Shim Location

By default, shims are created in `~/.local/bin`. You can specify a different location:

```bash
launchpad shim --path ~/bin node
```

Or set a default location in your configuration:

```json
{
  "shimPath": "~/bin"
}
```

## How Shims Work

When you create a shim for a package, Launchpad:

1. Queries pkgx for information about the package
2. Locates all executable files in the package's `bin` directory
3. Creates a lightweight script for each executable in your shim directory
4. Makes these scripts executable
5. Optionally adds the shim directory to your PATH

The generated shim looks like this:

```sh
#!/usr/bin/env -S pkgx -q! node@22.12.0
```

This tells your system to use pkgx to run the specific version of the package.

## PATH Integration

For shims to work, the shim directory must be in your PATH. Launchpad can automatically add the shim directory to your PATH by modifying your shell configuration file:

```bash
# Launchpad will add the shim directory to your PATH automatically
launchpad shim node
```

If you don't want automatic PATH modifications:

```bash
launchpad shim --no-auto-path node
```

Or disable it in your configuration:

```json
{
  "autoAddToPath": false
}
```

## Force Recreation

To recreate existing shims:

```bash
launchpad shim --force node
```

## Shell Configuration Files

When adding to PATH, Launchpad looks for these files (in order):

1. `~/.zshrc` (if using Zsh)
2. `~/.bashrc` (if using Bash)
3. `~/.bash_profile` (if using Bash and .bashrc doesn't exist)

## Windows Support

On Windows, Launchpad cannot directly modify the PATH. Instead, it provides instructions for adding the shim directory to your PATH:

```powershell
[System.Environment]::SetEnvironmentVariable('PATH', $env:PATH + ';C:\path\to\shims', [System.EnvironmentVariableTarget]::Machine)
```

## Verification

After creating shims, you can verify they're working:

```bash
# Check if a shim is available
which node

# Should output something like:
# /home/user/.local/bin/node
```
