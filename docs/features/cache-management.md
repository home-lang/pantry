# Cache Management

Launchpad provides powerful cache management and cleanup capabilities to help you manage disk space and maintain a clean development environment. This includes both selective cache clearing and comprehensive system cleanup.

## Overview

Launchpad caches downloaded packages to improve performance when switching between versions or reinstalling packages. Over time, this cache can grow large, and you may want to clean it up or perform a complete system reset.

## Cache Structure

Launchpad stores cached data in the following locations:

```
~/.cache/launchpad/
├── binaries/
│   ├── packages/          # General package cache
│   │   ├── bun.sh-1.2.2/
│   │   ├── nodejs.org-20.0.0/
│   │   └── python.org-3.11.0/
│   └── bun/               # Bun-specific cache
│       ├── 1.2.2
│       ├── 1.2.4
│       └── 1.2.3
```

## Commands

### Cache Clear Command

The `cache:clear` command removes all cached downloads while preserving installed packages.

```bash
# Preview what would be cleared
launchpad cache:clear --dry-run

# Clear cache with confirmation
launchpad cache:clear

# Clear cache without confirmation
launchpad cache:clear --force

# Clear cache with verbose output
launchpad cache:clear --verbose --force
```

**Alias:** You can also use `cache:clean` as an alias for `cache:clear`.

#### Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Show what would be cleared without actually clearing it |
| `--force` | Skip confirmation prompts |
| `--verbose` | Enable verbose output with detailed information |

#### What Gets Cleared

- **Package Cache:** `~/.cache/launchpad/binaries/packages/`
- **Bun Cache:** `~/.cache/launchpad/binaries/bun/`
- **All cached downloads and extracted packages**

#### Safety Features

- **Confirmation Required:** By default, requires confirmation before clearing
- **Dry-Run Mode:** Preview exactly what will be cleared with size calculations
- **Preserves Installed Packages:** Only removes cache, not actual installations

### Complete Cleanup Command

The `clean` command performs a comprehensive cleanup of all Launchpad-managed resources.

```bash
# Preview complete cleanup
launchpad clean --dry-run

# Perform complete cleanup
launchpad clean --force

# Clean packages but keep cache
launchpad clean --keep-cache --force

# Clean with verbose output
launchpad clean --verbose --force
```

#### Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Show what would be removed without actually removing it |
| `--force` | Skip confirmation prompts |
| `--keep-cache` | Keep cached downloads (only remove installed packages) |
| `--verbose` | Enable verbose output during cleanup |

#### What Gets Cleaned

1. **Launchpad Packages:** `{install_prefix}/pkgs/`
   - Only the `pkgs` subdirectory, not the entire install prefix
   - Safely preserves other tools installed in `/usr/local`

2. **Project Environments:** `~/.local/share/launchpad/`
   - All project-specific environments
   - Environment activation scripts

3. **Cache Directory:** `~/.cache/launchpad/` (unless `--keep-cache` is used)
   - All cached downloads
   - Temporary files

#### Safety Features

- **Targeted Cleanup:** Only removes Launchpad-specific directories
- **Confirmation Required:** Requires `--force` flag for actual cleanup
- **Detailed Preview:** Shows exactly what will be removed with sizes
- **Selective Options:** Can preserve cache while cleaning packages

## Usage Examples

### Basic Cache Management

```bash
# Check cache size
launchpad cache:clear --dry-run

# Clear cache when it gets too large
launchpad cache:clear --force
```

### Complete System Reset

```bash
# Preview what would be removed
launchpad clean --dry-run

# Complete reset (removes everything)
launchpad clean --force

# Reset packages but keep cache for faster reinstalls
launchpad clean --keep-cache --force
```

### Maintenance Workflow

```bash
# 1. Check what's installed and cached
launchpad list
launchpad cache:clear --dry-run

# 2. Clean up unused packages but keep cache
launchpad clean --keep-cache --dry-run
launchpad clean --keep-cache --force

# 3. Reinstall needed packages (will use cache)
launchpad install node python bun
```

## Output Examples

### Cache Clear Dry-Run

```bash
$ launchpad cache:clear --dry-run
🔍 DRY RUN MODE - Nothing will actually be cleared
Would clear Launchpad cache...
📊 Cache statistics:
   • Total size: 48.3 MB
   • File count: 4
   • Cache directory: /Users/user/.cache/launchpad

Would remove:
   • Package cache: /Users/user/.cache/launchpad/binaries/packages
   • Bun cache: /Users/user/.cache/launchpad/binaries/bun
```

### Clean Dry-Run

```bash
$ launchpad clean --dry-run
🔍 DRY RUN MODE - Nothing will actually be removed
Would perform complete cleanup...
📊 Cleanup statistics:
   • Total size: 156.6 MB
   • Total files: 6

Would remove:
   • Launchpad packages: /usr/local/pkgs (108.3 MB, 2 files)
   • Launchpad environments: /Users/user/.local/share/launchpad (0.0 B, 0 files)
   • Cache directory: /Users/user/.cache/launchpad (48.3 MB, 4 files)

📦 Launchpad-installed packages that would be removed:
   • bun.sh
   • node
```

## Performance Considerations

### Cache Benefits

- **Faster Reinstalls:** Cached packages install instantly
- **Version Switching:** No re-download when switching between cached versions
- **Offline Capability:** Can reinstall cached packages without internet

### When to Clear Cache

- **Disk Space:** When cache grows too large (check with `--dry-run`)
- **Corruption:** If cached packages become corrupted
- **Fresh Start:** When you want to ensure clean downloads

### Cache Size Management

```bash
# Monitor cache growth
launchpad cache:clear --dry-run

# Clear cache periodically (e.g., monthly)
launchpad cache:clear --force

# Or use selective cleanup
launchpad clean --keep-cache --force  # Keep cache, remove packages
```

## Integration with Other Commands

### Before Major Updates

```bash
# Clean slate before updating
launchpad clean --force
launchpad install node@latest python@latest
```

### Project Migration

```bash
# Clean old project environments
launchpad clean --keep-cache --force
# Cache is preserved for faster setup of new projects
```

### CI/CD Usage

```bash
# In CI environments, you might want to always start clean
launchpad clean --force --quiet
launchpad install node python bun
```

## Troubleshooting

### Permission Errors

If you encounter permission errors during cleanup:

```bash
# Check what would be removed
launchpad clean --dry-run

# Ensure you have write permissions to the directories
ls -la /usr/local/pkgs
ls -la ~/.cache/launchpad
```

### Partial Cleanup Failures

The commands handle partial failures gracefully:

- Continue cleaning other directories if one fails
- Report what was successfully cleaned
- Provide error details for failed operations

### Recovery

If you accidentally clean too much:

```bash
# Reinstall essential packages
launchpad install node python bun

# Recreate project environments
cd your-project
launchpad dev
```

## Best Practices

1. **Regular Maintenance:** Use `--dry-run` regularly to monitor cache size
2. **Selective Cleaning:** Use `--keep-cache` when you only want to reset packages
3. **Before Major Changes:** Clean before significant system changes
4. **Backup Important Data:** Ensure project files are backed up before cleaning
5. **Test in Development:** Use dry-run mode to understand impact before cleaning

## Related Commands

- [`launchpad list`](/features/package-management#listing-packages) - See what's installed
- [`launchpad install`](/features/package-management#installation) - Reinstall packages after cleaning
- [`launchpad dev`](/features/environment-management) - Recreate project environments
