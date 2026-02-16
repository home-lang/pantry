# Troubleshooting

This guide helps you diagnose and resolve common issues with pantry. Most problems can be solved quickly with the right diagnostic commands.

## Quick Diagnostics

### Check pantry Status

```bash
# Verify pantry is installed and working
pantry --version

# Check current configuration
pantry list --verbose

# Test shell integration
type _pkgx_chpwd_hook || echo "Shell integration not working"
```

### Environment Status

```bash
# Check current environment
echo "Environment hash: $pantry_ENV_HASH"
echo "Project name: $pantry_PROJECT_NAME"

# List all environments
pantry env:list

# Check for dependency files
ls -la {dependencies,pkgx,deps}.{yaml,yml} .{pantry,pkgx,deps}.{yaml,yml} 2>/dev/null
```

## Installation Issues

### Package Not Found

**Symptoms:**

- Error: "Package 'xyz' not found"
- Installation fails immediately

**Solutions:**

1. **Check package name and version:**

   ```bash
# Try different package name formats
   pantry install node@22      # Standard format
   pantry install nodejs.org@22  # With domain
   pantry install node         # Latest version
   ```

2. **Verify with pantry's search:**

   ```bash
   pantry search node
   pantry info node
   ```

3. **Use verbose mode for details:**

   ```bash
   pantry install --verbose node@22
   ```

### Permission Denied Errors

**Symptoms:**

- "Permission denied" when installing
- "EACCES" errors
- Installation fails after asking for password

**Solutions:**

1. **Check installation directory permissions:**

   ```bash
   ls -la /usr/local/
   ls -la ~/.local/
   ```

2. **Fix /usr/local permissions:**

   ```bash
   sudo chown -R $(whoami) /usr/local/bin /usr/local/sbin
   ```

3. **Use user-local installation:**

   ```bash
   pantry install --path ~/.local node@22
   ```

4. **Verify PATH includes user directories:**

   ```bash
   echo $PATH | grep -E "(\.local/bin|\.local/sbin)"
   ```

### Network/Download Issues

**Symptoms:**

- Timeouts during installation
- Download failures
- "Connection refused" errors

**Solutions:**

1. **Check internet connection:**

   ```bash
   curl -I https://pkgx.sh
   ```

2. **Increase timeout:**

   ```bash
   pantry install --timeout 120000 node@22  # 2 minutes
   ```

3. **Try different mirror or later:**

   ```bash
# Sometimes pkgx mirrors are temporarily down
# Wait a few minutes and try again
   ```

## Environment Issues

### Environment Not Activating

**Symptoms:**

- No activation message when entering directories
- Environment variables not set
- Wrong package versions in project

**Diagnosis:**

1. **Check shell integration:**

   ```bash
# Should show function definition
   type _pkgx_chpwd_hook

# Check shell config
   grep "pantry dev:shellcode" ~/.zshrc ~/.bashrc
   ```

2. **Verify dependency file:**

   ```bash
# Check file exists and has correct syntax
   cat dependencies.yaml
   pantry dev:dump --dryrun --verbose
   ```

3. **Test manual activation:**

   ```bash
   pantry dev:on
   ```

**Solutions:**

1. **Set up shell integration:**

   ```bash
   echo 'eval "$(pantry dev:shellcode)"' >> ~/.zshrc
   source ~/.zshrc
   ```

2. **Fix dependency file syntax:**

   ```yaml
# Correct format
   dependencies:

     - node@22
     - python@3.12

   env:
     NODE_ENV: development
   ```

3. **Reload shell environment:**

   ```bash
   source ~/.zshrc
# Or restart your terminal
   ```

### Shell Messages Not Showing

**Symptoms:**

- Environment activates but no messages appear
- Silent activation/deactivation

**Solutions:**

1. **Check message settings:**

   ```bash
   echo $pantry_SHOW_ENV_MESSAGES
   ```

2. **Enable messages:**

   ```bash
   export pantry_SHOW_ENV_MESSAGES=true
   ```

3. **Test custom messages:**

   ```bash
   export pantry_SHELL_ACTIVATION_MESSAGE="🔧 Environment ready: {path}"
   cd my-project/  # Should show custom message
   ```

### Wrong Package Versions

**Symptoms:**

- Project uses global versions instead of project-specific
- `node --version` shows unexpected version

**Solutions:**

1. **Check environment activation:**

   ```bash
   echo $pantry_ENV_HASH  # Should not be empty
   which node  # Should point to environment directory
   ```

2. **Verify PATH order:**

   ```bash
   echo $PATH
# Environment directories should come first
   ```

3. **Force environment reload:**

   ```bash
   cd .. && cd -  # Exit and re-enter directory
   ```

## Performance Issues

### Slow Environment Activation

**Symptoms:**

- Long delay when entering directories
- Slow command execution

**Solutions:**

1. **Clean up old environments:**

   ```bash
   pantry env:clean --older-than 7
   ```

2. **Check environment size:**

   ```bash
   pantry env:list --verbose
   du -sh ~/.local/share/pantry/envs/*
   ```

3. **Remove large/unused environments:**

   ```bash
   pantry env:remove large_environment_hash --force
   ```

### Disk Space Issues

**Symptoms:**

- "No space left on device" errors
- Installation failures due to disk space

**Solutions:**

1. **Check disk usage:**

   ```bash
   df -h ~/.local/share/pantry/
   du -sh ~/.local/share/pantry/envs/*
   ```

2. **Clean up environments:**

   ```bash
# Remove old environments
   pantry env:clean --older-than 14 --force

# Remove failed installations
   pantry env:clean --force
   ```

3. **Use custom location with more space:**

   ```bash
   export pantry_ENV_BASE_DIR=/path/to/larger/disk
   ```

## Configuration Issues

### Configuration Not Loading

**Symptoms:**

- Custom settings ignored
- Default behavior despite configuration file

**Solutions:**

1. **Check configuration file location:**

   ```bash
   ls -la pantry.config.{ts,js,json} .pantryrc
   ls -la ~/.config/pantry/config.json
   ```

2. **Validate configuration syntax:**

   ```bash
# For TypeScript files
   bunx tsc --noEmit pantry.config.ts

# For JSON files
   cat .pantryrc | python -m json.tool
   ```

3. **Test configuration loading:**

   ```bash
   pantry --verbose list  # Should show resolved config
   ```

### Environment Variables Not Working

**Symptoms:**

- Custom environment variables not set
- Wrong values in project environment

**Solutions:**

1. **Check dependency file:**

   ```bash
   cat dependencies.yaml
# Verify env section syntax
   ```

2. **Test variable expansion:**

   ```bash
   pantry dev:dump --verbose
   echo $MY_CUSTOM_VAR
   ```

3. **Check for shell conflicts:**

   ```bash
# Temporarily disable other shell customizations
# and test pantry environment
   ```

## Shell Integration Issues

### Shell Integration Not Working

**Symptoms:**

- Commands like `cd` don't trigger environment changes
- Manual `pantry dev:on` works but automatic doesn't

**Solutions:**

1. **Check shell type:**

   ```bash
   echo $SHELL
   ps -p $$
   ```

2. **Verify integration code:**

   ```bash
   pantry dev:shellcode  # Should output shell functions
   ```

3. **Check for conflicts:**

   ```bash
# Look for other tools that might interfere
   grep -E "(nvm|rbenv|pyenv)" ~/.zshrc ~/.bashrc
   ```

4. **Reinstall shell integration:**

   ```bash
# Remove old integration
   sed -i '/pantry dev:shellcode/d' ~/.zshrc

# Add fresh integration
   echo 'eval "$(pantry dev:shellcode)"' >> ~/.zshrc
   source ~/.zshrc
   ```

### Multiple Shell Conflicts

**Symptoms:**

- Environment doesn't activate in new shells
- Inconsistent behavior across terminals

**Solutions:**

1. **Check all shell config files:**

   ```bash
   grep "pantry" ~/.zshrc ~/.bashrc ~/.bash_profile ~/.profile
   ```

2. **Ensure consistent integration:**

   ```bash
# Add to all relevant shell configs
   for file in ~/.zshrc ~/.bashrc; do
     if [ -f "$file" ]; then
       echo 'eval "$(pantry dev:shellcode)"' >> "$file"
     fi
   done
   ```

### Starship Prompt Timeout Warnings

**Symptoms:**

- Warning messages like: `[WARN] - (starship::utils): Executing command "/.../bin/bun" timed out`
- Starship suggests: `You can set command_timeout in your config to a higher value`
- Timeout warnings when changing directories in projects

**Cause:**
Starship tries to execute pantry-managed binaries (like `bun`, `node`, etc.) to detect tool versions for the prompt. When pantry's environment is activating, these binaries might take longer to respond than Starship's default timeout allows.

**Solutions:**

1. **Increase Starship's command timeout (Recommended):**

   Add or update the `command_timeout` setting in your Starship configuration file (`~/.config/starship.toml`):

   ```toml
# Timeout for commands executed by starship (ms)
   command_timeout = 5000

# Rest of your Starship configuration
   [git_branch]
   symbol = "🌱 "

   [bun]
   symbol = "🐰 "
   ```

2. **Test the fix:**

   ```bash
# Restart your shell or source your config
   source ~/.zshrc

# Change directories to trigger environment activation
   cd ~/my-project
   ```

3. **Alternative: Disable specific modules:**

   If you don't need version detection for certain tools, you can disable them:

   ```toml
   [bun]
   disabled = true

   [nodejs]
   disabled = true
   ```

**Note:** A 5000ms (5-second) timeout is generous and should eliminate timeout warnings while still keeping your prompt responsive. The actual execution time is typically under 1 second.

## Uninstall/Cleanup Issues

### Complete Removal

**Symptoms:**

- Want to completely remove pantry
- Start fresh after problems

**Solutions:**

1. **Use uninstall command:**

   ```bash
   pantry uninstall --force
   ```

2. **Manual cleanup:**

   ```bash
# Remove packages
   rm -rf ~/.local/bin/pkgx ~/.local/bin/bun
   rm -rf ~/.local/share/pantry/

# Remove shell integration
   sed -i '/pantry/d' ~/.zshrc ~/.bashrc

# Remove global package
   npm uninstall -g ts-pantry
   ```

3. **Clean PATH:**

   ```bash
# Edit shell config to remove pantry paths
# Restart terminal
   ```

## Advanced Debugging

### Enable Debug Mode

```bash
# Set debug environment variables
export pantry_DEBUG=true
export PANTRY_VERBOSE=true

# Run commands with maximum verbosity
pantry --verbose install node@22
```

### Collect System Information

```bash
# System info for bug reports
echo "OS: $(uname -a)"
echo "Shell: $SHELL ($($SHELL --version))"
echo "pantry: $(pantry --version)"
echo "Node: $(node --version 2>/dev/null || echo 'not installed')"
echo "Bun: $(bun --version 2>/dev/null || echo 'not installed')"

# Environment info
echo "PATH: $PATH"
echo "HOME: $HOME"
echo "PWD: $PWD"
env | grep pantry
```

### Log Analysis

```bash
# Check system logs for pantry-related errors
grep -i pantry /var/log/system.log  # macOS
journalctl | grep -i pantry         # Linux systemd
```

## Getting Help

### Community Support

- **GitHub Discussions**: [stacksjs/pantry discussions](https://github.com/stacksjs/pantry/discussions)
- **Discord**: [Join Stacks Discord](https://discord.gg/stacksjs)
- **Issues**: [Report bugs](https://github.com/stacksjs/pantry/issues)

### Reporting Bugs

When reporting issues, include:

1. **System information** (from Advanced Debugging section above)
2. **Exact error messages**
3. **Steps to reproduce**
4. **Expected vs actual behavior**
5. **Configuration files** (sanitized)

## Service Management Issues

### Service Won't Start

**Symptoms**: Service fails to start or immediately stops
**Diagnosis**:

```bash
# Check if service binary is available
which postgres
which redis-server

# Check service logs
tail -f ~/.local/share/pantry/logs/postgres.log

# Check port availability
lsof -i :5432  # Check if PostgreSQL port is in use
```

**Common Causes**:

1. **Missing binary**: Install the service package first
2. **Port conflict**: Another service is using the same port
3. **Permission issues**: Data directory not writable
4. **Configuration errors**: Invalid service configuration

**Solutions**:

```bash
# Install missing service packages
pantry install postgresql@15

# Kill conflicting processes
sudo lsof -ti:5432 | xargs kill -9

# Fix data directory permissions
chown -R $USER ~/.local/share/pantry/services/

# Reset service configuration
rm ~/.local/share/pantry/services/config/postgres.conf
pantry service start postgres  # Regenerates default config
```

### Service Health Check Failures

**Symptoms**: Service shows as "failed" or "unknown" status
**Diagnosis**:

```bash
# Test health check manually
pg_isready -p 5432
redis-cli ping

# Check if health check tools are installed
which pg_isready
which redis-cli
```

**Solutions**:

```bash
# Install missing health check tools
pantry install postgresql@15  # Includes pg_isready
pantry install redis@7        # Includes redis-cli

# Test service manually
telnet localhost 5432  # Test basic connectivity
```

### Service Auto-Start Issues

**Symptoms**: Services don't start automatically
**Platform-Specific Diagnosis**:

#### macOS (launchd)

```bash
# Check launchd status
launchctl list | grep com.pantry

# Check plist file
cat ~/Library/LaunchAgents/com.pantry.postgres.plist

# Manual launchd operations
launchctl load ~/Library/LaunchAgents/com.pantry.postgres.plist
launchctl start com.pantry.postgres
```

#### Linux (systemd)

```bash
# Check systemd status
systemctl --user status pantry-postgres

# Check service logs
journalctl --user -u pantry-postgres

# Manual systemd operations
systemctl --user enable pantry-postgres
systemctl --user start pantry-postgres
```

### Service Configuration Issues

**Symptoms**: Service starts but behaves incorrectly
**Diagnosis**:

```bash
# Check generated configuration
cat ~/.local/share/pantry/services/config/redis.conf
cat ~/.local/share/pantry/services/config/nginx.conf

# Validate configuration syntax
nginx -t -c ~/.local/share/pantry/services/config/nginx.conf
```

**Solutions**:

```bash
# Regenerate default configuration
rm ~/.local/share/pantry/services/config/redis.conf
pantry service restart redis

# Edit configuration manually
nano ~/.local/share/pantry/services/config/redis.conf
pantry service restart redis
```

### Platform-Specific Service Issues

#### Windows

Service management is not supported on Windows. Services must be run manually:

```bash
# Run services manually on Windows
postgres -D data/
redis-server redis.conf
```

#### macOS Permission Issues

```bash
# Grant full disk access to Terminal.app
# System Preferences > Security & Privacy > Privacy > Full Disk Access

# Check Console.app for launchd errors
# Applications > Utilities > Console.app
```

#### Linux systemd Issues

```bash
# Enable systemd user services
sudo systemctl enable systemd-logind
loginctl enable-linger $USER

# Reload systemd configuration
systemctl --user daemon-reload
```

### Service Data and Log Issues

**Symptoms**: Services lose data or logs are missing
**Diagnosis**:

```bash
# Check data directories
ls -la ~/.local/share/pantry/services/
du -sh ~/.local/share/pantry/services/_/

# Check log files
ls -la ~/.local/share/pantry/logs/
tail -f ~/.local/share/pantry/logs/_.log
```

**Solutions**:

```bash
# Create missing directories
mkdir -p ~/.local/share/pantry/services/postgres/data
mkdir -p ~/.local/share/pantry/logs

# Fix permissions
chown -R $USER ~/.local/share/pantry/
chmod -R 755 ~/.local/share/pantry/

# Backup data before troubleshooting
tar -czf services-backup.tar.gz ~/.local/share/pantry/services/
```

### Service Network and Port Issues

**Symptoms**: Can't connect to service ports
**Diagnosis**:

```bash
# Check if ports are listening
netstat -an | grep 5432
lsof -i :5432

# Check firewall rules (Linux)
sudo ufw status
sudo iptables -L

# Test connectivity
telnet localhost 5432
curl http://localhost:8080/health
```

**Solutions**:

```bash
# Kill processes using conflicting ports
sudo lsof -ti:5432 | xargs kill -9

# Configure firewall (if needed)
sudo ufw allow 5432/tcp

# Change service port in configuration
nano ~/.local/share/pantry/services/config/postgres.conf
# Change: port = 5433
pantry service restart postgres
```

### Service Management Commands Not Working

**Symptoms**: `pantry service` commands fail
**Diagnosis**:

```bash
# Check if service management is enabled
echo $pantry_SERVICES_ENABLED

# Check platform support
pantry service list  # Should show available services
```

**Solutions**:

```bash
# Enable service management
export pantry_SERVICES_ENABLED=true

# On unsupported platforms, services must be run manually
# Use Docker or other container solutions for service management
```

### Self-Help Resources

- **Built-in help**: `pantry help`, `pantry <command> --help`
- **Service documentation**: [Service Management](./features/service-management.md)
- **Configuration reference**: [Configuration Guide](./config.md)
- **Usage examples**: [Examples](./examples.md)
- **API documentation**: [API Reference](./api/reference.md)

Remember: Most issues are quickly resolvable with the right diagnostic approach. Start with the Quick Diagnostics section and work your way through the relevant troubleshooting steps.
