# Pantry Usage Examples

Comprehensive examples for all new Pantry features.

## Table of Contents

- [Package Initialization](#package-initialization)
- [Dependency Visualization](#dependency-visualization)
- [Package Signing & Verification](#package-signing--verification)
- [Offline Mode](#offline-mode)
- [Proxy Configuration](#proxy-configuration)
- [Error Recovery](#error-recovery)

---

## Package Initialization

### Basic Project Setup

```bash
# Navigate to your project directory
cd my-new-project

# Initialize pantry.json interactively
pantry init
```

**Interactive prompts:**

```
📦 Initializing pantry.json

Project name (my-new-project):
Version (1.0.0):
Description: A sample project

✅ Created pantry.json

📝 Next steps:

   1. Add dependencies: pantry add <package>@<version>
   2. Install packages: pantry install
   3. Add scripts to the 'scripts' section

```

### Auto-Detection

If `pantry init` detects existing config files, it adapts:

**TypeScript/Node Project** (has `tsconfig.json` or `package.json`):

```json
{
  "name": "my-ts-project",
  "version": "1.0.0",
  "dependencies": {
    "bun": "latest"
  },
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "build": "bun build src/index.ts --outdir dist",
    "test": "bun test",
    "start": "bun run src/index.ts"
  },
  "services": {
    "redis": {
      "autoStart": false,
      "port": 6379
    }
  }
}
```

**Generic Project**:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {},
  "devDependencies": {},
  "scripts": {
    "dev": "echo 'Add your dev command here'",
    "build": "echo 'Add your build command here'",
    "test": "echo 'Add your test command here'"
  },
  "services": {},
  "workspaces": []
}
```

---

## Dependency Visualization

### Basic Tree View

```bash
pantry tree
```

**Output:**

```
├── ⚬ bun@1.3.0
├── ⚬ typescript@5.0.0
└── ⚬ @types/node@20.0.0

Legend:
  ⚬ normal dependency
  ⚬ dev dependency
```

### Hide Version Numbers

```bash
pantry tree --no-versions
```

**Output:**

```
├── ⚬ bun
├── ⚬ typescript
└── ⚬ @types/node
```

### Filter by Dependency Type

```bash
# Hide dev dependencies
pantry tree --no-dev

# Show peer dependencies
pantry tree --peer
```

### Limit Tree Depth

```bash
# Show only top 2 levels
pantry tree --depth=2
```

### JSON Output

```bash
pantry tree --json
```

**Output:**

```json
{
  "dependencies": [
    {
      "name": "bun",
      "version": "1.3.0",
      "type": "normal",
      "dependencies": []
    },
    {
      "name": "typescript",
      "version": "5.0.0",
      "type": "dev",
      "dependencies": []
    }
  ]
}
```

### Complex Project Example

```bash
pantry tree --peer
```

**Output:**

```
├── ⚬ react@18.2.0
│   ├── ⚬ loose-envify@1.4.0
│   └── ⚬ scheduler@0.23.0
├── ⚬ react-dom@18.2.0
│   ├── ⚬ loose-envify@1.4.0
│   ├── ⚬ react@18.2.0
│   └── ⚬ scheduler@0.23.0
└── ⚬ typescript@5.0.0

Legend:
  ⚬ normal dependency
  ⚬ dev dependency
  ⚬ peer dependency
```

---

## Package Signing & Verification

### Generate Keypair

```bash
pantry generate-key
```

**Output:**

```
🔐 Generated Ed25519 keypair

Public Key (add to keyring):
ed25519:a1b2c3d4e5f6...

Private Key (keep secret!):
ed25519_private:9876543210fed...

📝 Save your private key securely!

   - Do NOT commit to version control
   - Consider using a secrets manager
   - Backup in a secure location

💡 To verify packages, add your public key to ~/.pantry/keyring.json
```

### Setup Keyring

Create or edit `~/.pantry/keyring.json`:

```json
{
  "mycompany": "ed25519:a1b2c3d4e5f6...",
  "npmjs": "ed25519:npm_official_key...",
  "github": "ed25519:github_official_key..."
}
```

### Sign a Package

```bash
# Sign a tarball
pantry sign dist/mypackage-1.0.0.tar.gz ed25519_private:9876543210fed...

# Specify output location
pantry sign dist/mypackage-1.0.0.tar.gz <private-key> -o dist/mypackage-1.0.0.tar.gz.sig
```

**Output:**

```
🔏 Signing package...

✅ Package signed successfully!
   Signature: dist/mypackage-1.0.0.tar.gz.sig
   Algorithm: Ed25519
   Hash: SHA256

📦 Signature file created:
{
  "version": "1.0",
  "algorithm": "ed25519",
  "signature": "a1b2c3...",
  "publicKey": "ed25519:a1b2c3d4e5f6...",
  "timestamp": 1234567890,
  "package": {
    "name": "mypackage-1.0.0.tar.gz",
    "hash": "sha256:def456..."
  }
}
```

### Verify Package

```bash
# Verify with default keyring
pantry verify dist/mypackage-1.0.0.tar.gz

# Verify with specific keyring
pantry verify dist/mypackage-1.0.0.tar.gz --keyring ~/.pantry/keyring.json

# Verbose output
pantry verify dist/mypackage-1.0.0.tar.gz -v
```

**Success Output:**

```
🔍 Verifying package signature...

✅ Signature valid!
   Signed by: ed25519:a1b2c3d4e5f6...
   Algorithm: Ed25519
   Timestamp: 2024-01-15 10:30:45 UTC
   Package hash: sha256:def456... ✓
```

**Failure Output:**

```
❌ Signature verification failed!
   Reason: Public key not in keyring

💡 Add the public key to your keyring:
   echo '{"mykey": "ed25519:a1b2c3d4e5f6..."}' >> ~/.pantry/keyring.json
```

### Publishing Workflow

```bash
# 1. Build your package
npm run build
tar -czf dist/mypackage-1.0.0.tar.gz -C dist .

# 2. Sign it
pantry sign dist/mypackage-1.0.0.tar.gz $PRIVATE_KEY

# 3. Publish both files
pantry publish dist/mypackage-1.0.0.tar.gz
pantry publish dist/mypackage-1.0.0.tar.gz.sig

# 4. Users can verify before installation
pantry verify mypackage-1.0.0.tar.gz
pantry install mypackage@1.0.0
```

---

## Offline Mode

### Enable Offline Mode

```bash
# Method 1: Environment variable
export PANTRY_OFFLINE=1
pantry install

# Method 2: Command flag (if implemented)
pantry install --offline
```

### Typical Workflow

```bash
# 1. Install packages normally (populates cache)
pantry install

# 2. Go offline (airplane mode, no network, etc.)
export PANTRY_OFFLINE=1

# 3. Install works from cache
cd ~/another-project
pantry install  # Uses cached packages

# 4. Try to install uncached package
cd ~/new-project
pantry install  # Fails with helpful message
```

**Output when package not in cache:**

```
🔌 Offline mode enabled - using cache only

❌ bun@1.3.0 not found in cache (offline mode)

💡 Suggestions:

   1. Install while online to cache the package
   2. Check your version requirements in pantry.json
   3. Disable offline mode temporarily: unset PANTRY_OFFLINE

```

### Cache Location

Packages are cached at: `~/.pantry/cache/packages/`

```bash
# View cached packages
ls ~/.pantry/cache/packages/

# Example structure
# ~/.pantry/cache/packages/
# ├── bun/
# │   ├── 1.3.0/
# │   └── 1.3.1/
# ├── typescript/
# │   └── 5.0.0/
# └── @types/
# └── node/
# └── 20.0.0/
```

---

## Proxy Configuration

### Basic Proxy Setup

```bash
# HTTP proxy
export HTTP_PROXY=http://proxy.company.com:8080

# HTTPS proxy
export HTTPS_PROXY=https://proxy.company.com:8080

# Install packages
pantry install
```

### Proxy with Authentication

```bash
# Proxy with credentials
export HTTP_PROXY=http://username:password@proxy.company.com:8080
export HTTPS_PROXY=https://username:password@proxy.company.com:8080

pantry install
```

### Bypass Proxy for Specific Hosts

```bash
# NO_PROXY environment variable
export NO_PROXY=localhost,127.0.0.1,.local,.internal

# Wildcards work
export NO_PROXY=*

# Comma-separated list
export NO_PROXY=localhost,127.0.0.1,192.168.0.0/16,.company.internal

pantry install
```

### Complete Corporate Setup

```bash
# Add to ~/.zshrc or ~/.bashrc
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=https://proxy.company.com:8080
export NO_PROXY=localhost,127.0.0.1,.local,.company.internal,10.0.0.0/8

# Test configuration
pantry install --verbose
```

### Troubleshooting Proxy Issues

```bash
# Test if proxy is reachable
curl -x http://proxy.company.com:8080 https://registry.npmjs.org

# Verify proxy environment variables
echo $HTTP_PROXY
echo $HTTPS_PROXY
echo $NO_PROXY

# Install with verbose output to see proxy usage
pantry install --verbose
```

---

## Error Recovery

### Network Errors

**Scenario:** Internet connection drops during installation

```bash
pantry install
```

**Output:**

```
➤ Installing 5 package(s)...
✓ bun@1.3.0
✓ typescript@5.0.0
✗ @types/node@20.0.0 (failed: ConnectionRefused)

❌ Error: Network connection failed

💡 Suggestions:

   1. Check your internet connection
   2. Try again with --offline flag to use cached packages
   3. Check if a proxy is required (HTTP_PROXY environment variable)
   4. Verify the registry URL is accessible

```

**Solution:**

```bash
# Try offline mode
export PANTRY_OFFLINE=1
pantry install

# Or configure proxy if needed
export HTTP_PROXY=http://proxy.company.com:8080
pantry install
```

### Permission Errors

**Scenario:** Insufficient permissions to install

```bash
pantry install --global
```

**Output:**

```
❌ Error: Permission denied

💡 Suggestions:

   1. Try running with appropriate permissions
   2. Check file/directory ownership
   3. Use --global flag to install system-wide (requires sudo)

```

**Solution:**

```bash
# Install to user directory instead
pantry install --user

# Or use sudo for global install
sudo pantry install --global
```

### Disk Space Errors

**Scenario:** Not enough disk space

```bash
pantry install
```

**Output:**

```
❌ Error: Insufficient disk space

💡 Suggestions:

   1. Free up disk space
   2. Run 'pantry cache:clear' to remove cached packages
   3. Check available disk space with 'df -h'

```

**Solution:**

```bash
# Clear cache
pantry cache:clear

# Check disk space
df -h

# Try again
pantry install
```

### Corrupted Package Errors

**Scenario:** Downloaded package is corrupted

```bash
pantry install
```

**Output:**

```
✗ bun@1.3.0 (failed: InvalidCharacter)

❌ Error: Package appears to be corrupted

💡 Suggestions:

   1. Clear cache: pantry cache:clear
   2. Try installing again
   3. Report the issue if it persists

```

**Solution:**

```bash
# Clear specific package from cache
pantry cache:clear

# Reinstall
pantry install
```

### Version Conflict Errors

**Scenario:** Conflicting dependency versions

```bash
pantry install
```

**Output:**

```
❌ Error: Version conflict detected

💡 Suggestions:

   1. Check dependency versions in pantry.json
   2. Try updating to compatible versions
   3. Use 'pantry tree' to visualize dependency conflicts
   4. Consider using version ranges instead of exact versions

```

**Solution:**

```bash
# Visualize the dependency tree
pantry tree

# Check for conflicts
pantry why conflicting-package

# Update pantry.json with compatible versions
# Then retry
pantry install
```

### Automatic Rollback

**Scenario:** Critical failure during installation

```bash
pantry install
```

**Output:**

```
➤ Installing 5 package(s)...
✓ bun@1.3.0
✓ typescript@5.0.0
✗ @types/node@20.0.0 (failed: critical error)

🔄 Rolling back installation...
✅ Rollback completed successfully

3 packages failed to install

⚠️  Some packages failed. Use 'pantry clean' to reset, or fix errors and retry.
```

The rollback feature:

- Creates checkpoints before installation
- Records all installed files and directories
- Creates backups of existing files
- Automatically reverts changes on critical errors
- Provides recovery suggestions

**Manual Recovery:**

```bash
# Clean and start fresh
pantry clean

# Or clean specific directories
pantry clean --local

# Then retry installation
pantry install
```

---

## Real-World Scenarios

### Scenario 1: Setting Up a New Project

```bash
# 1. Create and initialize project
mkdir my-app && cd my-app
pantry init

# 2. Add dependencies
pantry add bun@latest typescript@5.0.0

# 3. View dependency tree
pantry tree

# 4. Install packages
pantry install

# 5. Start development
pantry dev
```

### Scenario 2: Working Offline

```bash
# Before going offline, ensure packages are cached
pantry install

# Enable offline mode
export PANTRY_OFFLINE=1

# Work on multiple projects offline
cd ~/project1 && pantry install
cd ~/project2 && pantry install
cd ~/project3 && pantry install

# All installations use cache - no network needed
```

### Scenario 3: Corporate Environment

```bash
# Configure proxy
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=https://proxy.company.com:8080
export NO_PROXY=localhost,.company.internal

# Configure custom registry
export PANTRY_REGISTRY=https://npm.company.internal

# Verify signed packages from internal registry
pantry verify package.tar.gz --keyring ~/.pantry/company-keyring.json

# Install packages
pantry install
```

### Scenario 4: CI/CD Pipeline

```bash
# !/bin/bash
# .github/workflows/build.yml

# Install dependencies from lockfile
pantry install --frozen-lockfile

# Verify all packages are signed
for pkg in ~/.pantry/cache/packages/*; do
    pantry verify "$pkg" --keyring ./.pantry/keyring.json
done

# Build project
pantry build

# Run tests
pantry test
```

---

## Tips & Best Practices

### Package Signing

- **Always** keep private keys secure and never commit them
- Use environment variables or secrets managers for CI/CD
- Maintain a keyring file per environment (dev, staging, prod)
- Rotate keys periodically

### Offline Mode

- Pre-cache packages before traveling or going offline
- Use `--offline` flag in CI/CD for faster, reproducible builds
- Combine with `--frozen-lockfile` for maximum reproducibility

### Proxy Configuration

- Add proxy config to shell profile (~/.zshrc, ~/.bashrc)
- Use NO_PROXY for internal company domains
- Test proxy configuration with `--verbose` flag

### Error Recovery

- Always read the contextual suggestions provided
- Use `pantry tree` to debug dependency conflicts
- Keep caches clean with periodic `pantry cache:clear`
- Use `pantry clean` for nuclear option (complete reset)

### General

- Use `pantry tree` regularly to understand dependencies
- Enable `--verbose` for debugging
- Check `pantry.lock` into version control
- Use version ranges instead of exact versions when possible
