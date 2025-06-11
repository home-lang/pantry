# Cross-platform Compatibility

Launchpad is designed to work seamlessly across different operating systems. This guide explains how Launchpad handles platform-specific nuances and how to optimize your usage for cross-platform scenarios.

## Platform Detection

Launchpad automatically detects the operating system it's running on and adjusts its behavior accordingly:

```typescript
// Example of how Launchpad detects platforms internally
import { platform } from 'node:os'

const isWindows = platform() === 'win32'
const isMacOS = platform() === 'darwin'
const isLinux = platform() === 'linux'
```

## Installation Philosophy Across Platforms

Launchpad follows the **pkgm approach** consistently across all platforms:

### Unix-like Systems (macOS, Linux)
- **Primary**: `/usr/local` for system-wide installations
- **Fallback**: `~/.local` for user-specific installations
- **Never uses**: `/opt/homebrew` (Homebrew's directory)
- **Maintains**: Clean separation from package managers like Homebrew

### Windows
- **Primary**: `%LOCALAPPDATA%` for user-specific installations
- **Alternative**: `%PROGRAMFILES%` for system-wide (requires elevation)
- **Avoids**: Conflicting with Windows package managers

This consistent approach ensures clean coexistence with existing package managers on all platforms.

## Path Handling

### Windows Path Differences

On Windows, paths use backslashes (`\`) rather than forward slashes (`/`). Launchpad normalizes paths internally:

```typescript
// Example of path normalization
import path from 'node:path'

const normalizedPath = path.normalize('/usr/local/bin')
// On Windows, this becomes something like 'C:\usr\local\bin'
```

### Home Directory Resolution

Launchpad resolves the `~` symbol to the user's home directory across all platforms:

```typescript
// Launchpad's internal approach
const homePath = process.env.HOME || process.env.USERPROFILE || '~'
```

## Shell Integration

Each platform uses different shells by default:

- **Windows**: PowerShell or CMD
- **macOS**: Zsh (newer versions) or Bash (older versions)
- **Linux**: Bash, Zsh, or others

Launchpad adapts its PATH modification strategies accordingly.

### Shell Message Customization by Platform

You can customize shell messages differently on each platform:

```bash
# macOS/Linux - Using ~/.zshrc or ~/.bashrc
export LAUNCHPAD_SHELL_ACTIVATION_MESSAGE="🍎 macOS environment ready: {path}"
export LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE="🍎 macOS environment closed"
```

```powershell
# Windows - Using PowerShell profile
$env:LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = "🪟 Windows environment ready: {path}"
$env:LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE = "🪟 Windows environment closed"
```

## File System Permissions

Permission handling differs by platform:

- **Unix-like Systems** (macOS, Linux): Uses Unix permissions (rwx)
- **Windows**: Uses ACLs (Access Control Lists)

When creating shims, Launchpad sets the appropriate permissions:

```typescript
// On Unix-like systems
fs.chmodSync(shimPath, 0o755) // Makes file executable

// On Windows
// No explicit chmod needed; Windows handles differently
```

## Sudo Handling

Elevated privileges are required for certain operations, and the approach varies by platform:

- **Unix-like Systems**: Uses `sudo`
- **Windows**: Requires running as Administrator

Launchpad's auto-sudo feature automatically adapts to the platform.

## Platform-specific Example: PATH Management

### macOS/Linux

```bash
# Add to PATH on Unix-like systems
echo 'export PATH="~/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Custom shell messages
echo 'export LAUNCHPAD_SHELL_ACTIVATION_MESSAGE="🔧 Dev environment: {path}"' >> ~/.zshrc
```

### Windows (PowerShell)

```powershell
# Add to PATH on Windows
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$newPath = "$env:USERPROFILE\.local\bin;" + $currentPath
[Environment]::SetEnvironmentVariable("PATH", $newPath, "User")

# Custom shell messages
[Environment]::SetEnvironmentVariable("LAUNCHPAD_SHELL_ACTIVATION_MESSAGE", "🔧 Dev environment: {path}", "User")
```

## Executable Detection

Different platforms use different file extensions for executables:

- **Unix-like Systems**: No extension required (permissions matter)
- **Windows**: `.exe`, `.bat`, `.cmd`, etc.

Launchpad handles these differences when creating and detecting executables.

## Platform-specific Installation Paths

Default installation paths vary by platform but follow consistent principles:

### macOS
- **System-wide**: `/usr/local` (preferred, like pkgm)
- **User-specific**: `~/.local` (fallback)
- **Never uses**: `/opt/homebrew` (Homebrew's directory)

### Linux
- **System-wide**: `/usr/local` (preferred, like pkgm)
- **User-specific**: `~/.local` (fallback)
- **Respects**: Existing system package manager directories

### Windows
- **User-specific**: `%LOCALAPPDATA%\Programs\Launchpad` (preferred)
- **System-wide**: `%PROGRAMFILES%\Launchpad` (requires elevation)

> [!NOTE]
> Launchpad installs packages to `/usr/local` (like pkgm), not to Homebrew's `/opt/homebrew` directory. This ensures clean separation from Homebrew-managed packages and allows peaceful coexistence.

## Integration with pkgx

pkgx itself is cross-platform, and Launchpad leverages this to provide a consistent experience across operating systems.

## Testing Across Platforms

When developing with Launchpad, it's good practice to test on multiple platforms:

```bash
# Basic testing on Unix-like systems
launchpad install node@22
node --version

# Verify shim creation
ls -la ~/.local/bin/node

# Test environment messages
cd my-project/  # Should show activation message
cd ../          # Should show deactivation message
```

```powershell
# Basic testing on Windows
launchpad install node@22
node --version

# Verify shim creation
dir $env:USERPROFILE\.local\bin\node.exe

# Test environment messages
cd my-project  # Should show activation message
cd ..\         # Should show deactivation message
```

## Cross-platform CI/CD Integration

For CI/CD pipelines, you can use Launchpad consistently across platforms:

```yaml
# Example GitHub Actions workflow
jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - name: Install Launchpad
        run: npm install -g @stacksjs/launchpad
      - name: Install dependencies with Launchpad
        run: launchpad install node@22 python@3.12
      - name: Test environment activation
        run: |
          cd test-project
          # Environment should activate automatically with shell integration
```

## Platform-specific Configuration

### macOS Configuration

```typescript
// launchpad.config.ts for macOS
export default {
  installationPath: '/usr/local', // Preferred on macOS
  shellActivationMessage: '🍎 macOS environment ready: {path}',
  shellDeactivationMessage: '🍎 Environment closed',
  // Use Homebrew paths for fallback when needed
  fallbackPaths: ['/opt/homebrew/bin', '/usr/local/bin']
}
```

### Linux Configuration

```typescript
// launchpad.config.ts for Linux
export default {
  installationPath: '/usr/local', // Preferred on Linux
  shellActivationMessage: '🐧 Linux environment ready: {path}',
  shellDeactivationMessage: '🐧 Environment closed',
  // Respect system package manager paths
  fallbackPaths: ['/usr/bin', '/usr/local/bin']
}
```

### Windows Configuration

```typescript
// launchpad.config.ts for Windows
export default {
  installationPath: `${process.env.LOCALAPPDATA}\\Programs\\Launchpad`,
  shellActivationMessage: '🪟 Windows environment ready: {path}',
  shellDeactivationMessage: '🪟 Environment closed',
  // Windows-specific paths
  fallbackPaths: ['C:\\Program Files\\Git\\bin']
}
```

## Troubleshooting Cross-platform Issues

### Path Separator Issues

```bash
# Use path.join() for cross-platform compatibility
const installPath = path.join(baseDir, 'bin', 'executable')
```

### Environment Variable Differences

```bash
# Unix-like systems
export LAUNCHPAD_PATH=/usr/local

# Windows
set LAUNCHPAD_PATH=C:\usr\local
# or in PowerShell
$env:LAUNCHPAD_PATH = "C:\usr\local"
```

### Shell Integration Differences

```bash
# For Bash/Zsh (Unix-like)
echo 'eval "$(launchpad dev:shellcode)"' >> ~/.zshrc

# For PowerShell (Windows)
Add-Content $PROFILE 'Invoke-Expression (& launchpad dev:shellcode)'
```
