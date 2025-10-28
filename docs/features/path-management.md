# PATH Management

pantry includes automatic PATH management to ensure that installed packages and tools are accessible from your terminal.

## How PATH Management Works

When you install packages or create shims with pantry, the binaries are typically placed in directories like `/usr/local/bin` or `~/.local/bin`. For these binaries to be accessible from anywhere in your terminal, these directories need to be in your PATH environment variable.

pantry can automatically:

1. Check if the relevant directories are in your PATH
2. Add them to your shell configuration files if they're not
3. Provide instructions for sourcing your updated configuration

## Automatic PATH Updates

By default, pantry will automatically update your PATH when needed:

```bash
# This will add the shim directory to PATH if it's not already there
pantry shim node
pantry dev
```

## Disabling Automatic PATH Updates

If you prefer to manage your PATH yourself, you can disable automatic updates:

```bash
# Disable for a specific command
pantry shim --no-auto-path node

# Or in your configuration
# ~/.pantryrc or pantry.config.ts
{
  "autoAddToPath": false
}
```

## Supported Shell Configuration Files

pantry looks for and modifies these shell configuration files (in order of precedence):

1. `~/.zshrc` - for Zsh users
2. `~/.bashrc` - for Bash users
3. `~/.bash_profile` - alternative for Bash users

The changes made look like:

```sh
# Added by pantry
export PATH="/home/user/.local/bin:$PATH"
```

## Cross-platform Support

### Unix-like Systems (macOS, Linux)

On Unix-like systems, pantry modifies shell configuration files directly.

### Windows

On Windows, pantry cannot directly modify the PATH. Instead, it provides instructions for adding directories to your PATH:

```powershell
[System.Environment]::SetEnvironmentVariable('PATH', $env:PATH + ';C:\path\to\shims', [System.EnvironmentVariableTarget]::Machine)
```

## Applying PATH Changes

After PATH updates, you need to apply the changes to your current terminal session:

```bash
# For Zsh
source ~/.zshrc

# For Bash
source ~/.bashrc  # or ~/.bash_profile
```

pantry will provide these instructions when it updates your PATH.

## Verifying PATH Configuration

To verify that a directory is in your PATH:

```bash
echo $PATH
```

This will display all directories in your PATH, separated by colons (on Unix-like systems) or semicolons (on Windows).

## Troubleshooting

If you're having issues with PATH management:

1. **Manual PATH addition**:

   ```bash
   # For Zsh/Bash
   echo 'export PATH="~/.local/bin:$PATH"' >> ~/.zshrc  # or ~/.bashrc
   source ~/.zshrc  # or ~/.bashrc
   ```

2. **Check directory existence**:

   ```bash
   ls -la ~/.local/bin  # or your shim directory
   ```

3. **Verify executable permissions**:

   ```bash
   ls -la ~/.local/bin/node  # replace 'node' with your shim
   # Should show -rwxr-xr-x (executable)
   ```

4. **Restart your terminal** - Some changes require a terminal restart to take effect.
