# Manual End-to-End Verification Guide

## Test Scenarios for Enhanced Launchpad System

### Prerequisites
- Clean launchpad environment (run `rm -rf ~/.local/share/launchpad/envs/*`)
- The `deps.yaml` file in the target project
- Working Node.js runtime (for running launchpad itself)

### Test 1: Clean State to Working Laravel Environment

**Objective**: Verify that entering a Laravel project directory automatically sets up the complete development environment.

**Steps**:
1. **Clean Environment**:
   ```bash
   rm -rf ~/.local/share/launchpad/envs/the-one-otc-api_*
   ```

2. **Verify deps.yaml**:
   ```bash
   cd the-one-otc-api
   cat deps.yaml
   ```
   Should show:
   ```yaml
   dependencies:
     bun: ^1.2.16
     node: ^22.17.0
     php: ^8.4.0
     composer: ^2.8.9
     postgres: ^17.2.0
     redis: ^8.0.3

   services:
     enabled: true
     autoStart:
       - postgres
       - redis
   ```

3. **Trigger Automatic Setup**:
   ```bash
   # This should automatically:
   # - Detect deps.yaml
   # - Install all dependencies with library fixes
   # - Detect Laravel project
   # - Start PostgreSQL and Redis services
   # - Create database 'the_one_otc_api'
   launchpad dev .
   ```

4. **Verify Environment Activation**:
   ```bash
   # Should show launchpad environment in PATH
   echo $PATH | grep launchpad

   # Should find PHP
   which php
   php --version  # Should work without dyld errors

   # Should find Composer
   which composer
   composer --version
   ```

5. **Test Laravel Commands**:
   ```bash
   # Should work immediately without additional setup
   php artisan migrate:fresh --seed
   php artisan serve
   ```

**Expected Results**:
- ✅ Environment created automatically on `cd`
- ✅ PHP working without library errors
- ✅ PostgreSQL service running
- ✅ Database created automatically
- ✅ Laravel migrations run successfully
- ✅ No manual intervention required

### Test 2: PHP Homebrew-Style Build Verification

**Objective**: Verify that our Homebrew-style PHP source building works correctly.

**Test Command**:
```bash
# Test the PHP source building function
cd launchpad/packages/launchpad
node -e "
const { buildPhpFromSource } = require('./dist/install.js');
buildPhpFromSource('/tmp/test-php-install', '8.4.0')
  .then(result => console.log('✅ PHP source build successful:', result.length, 'files'))
  .catch(err => console.log('❌ PHP source build failed:', err.message));
"
```

**Expected Results**:
- ✅ Downloads PHP source from official php.net
- ✅ Configures with comprehensive Homebrew-style options
- ✅ Compiles with all CPU cores for performance
- ✅ Returns array of installed files
- ✅ No library linking issues (built from source)

### Test 3: Laravel Detection and Service Setup

**Objective**: Verify automatic Laravel project detection and service configuration.

**Test Setup**:
```bash
mkdir -p /tmp/test-laravel-project
cd /tmp/test-laravel-project

# Create Laravel project structure
echo '#!/usr/bin/env php' > artisan
chmod +x artisan

cat > composer.json << EOF
{
  "require": {
    "laravel/framework": "^11.0"
  }
}
EOF

cat > .env << EOF
DB_CONNECTION=pgsql
DB_DATABASE=test_laravel_project
REDIS_HOST=127.0.0.1
EOF

cat > deps.yaml << EOF
dependencies:
  php: ^8.4.0
  postgres: ^17.2.0
  redis: ^8.0.3
EOF
```

**Test Command**:
```bash
launchpad dev . --verbose
```

**Expected Results**:
- ✅ "Laravel project detected!" message
- ✅ "Setting up PostgreSQL for Laravel project..." message
- ✅ "Setting up Redis for Laravel project..." message
- ✅ Services started automatically
- ✅ Database created with project name

### Test 4: Shell Integration Verification

**Objective**: Verify that shell integration properly activates/deactivates environments.

**Test Commands**:
```bash
# Outside project
echo $PATH  # Should not contain launchpad env paths

cd the-one-otc-api
echo $PATH  # Should contain launchpad env paths

cd ..
echo $PATH  # Should not contain launchpad env paths (deactivated)
```

**Expected Results**:
- ✅ PATH updated when entering project
- ✅ Environment variables set correctly
- ✅ PATH restored when leaving project
- ✅ Clean activation/deactivation cycle

### Test 5: Error Handling and Fallbacks

**Objective**: Verify graceful handling of various failure scenarios.

**Test Scenarios**:

1. **Missing deps.yaml**:
   ```bash
   mkdir /tmp/no-deps-project
   cd /tmp/no-deps-project
   launchpad dev .
   # Should show "No dependency file found" and not fail
   ```

2. **Invalid deps.yaml**:
   ```bash
   echo "invalid: yaml: [" > deps.yaml
   launchpad dev .
   # Should handle gracefully and not crash
   ```

3. **Network issues** (simulate):
   ```bash
   # Test with offline mode if available
   LAUNCHPAD_OFFLINE=true launchpad dev .
   ```

**Expected Results**:
- ✅ Graceful error messages
- ✅ No crashes or unhandled exceptions
- ✅ Helpful suggestions for resolution
- ✅ Fallback mechanisms work

### Verification Checklist

After running all tests, verify:

- [ ] `deps.yaml` is automatically detected and processed
- [ ] PHP installs with library fixes (no dyld errors)
- [ ] Laravel projects are automatically detected
- [ ] PostgreSQL service starts and database is created
- [ ] Redis service starts for Laravel projects
- [ ] Shell integration works (PATH updates)
- [ ] `php artisan migrate:fresh --seed` works immediately
- [ ] Error scenarios are handled gracefully
- [ ] No manual intervention required for typical Laravel setup
- [ ] Performance is acceptable (< 2 minutes for full setup)

### Success Criteria

The system is working correctly when:

1. **Zero Manual Setup**: Entering a Laravel project directory automatically sets up the complete environment
2. **Library Issues Resolved**: PHP works without dyld errors
3. **Service Management**: PostgreSQL and Redis start automatically
4. **Database Creation**: Project database is created automatically
5. **Laravel Ready**: `php artisan` commands work immediately
6. **Clean Integration**: Environment activates/deactivates seamlessly

### Performance Benchmarks

Target performance metrics:
- Initial setup (cold): < 2 minutes
- Cached setup (warm): < 10 seconds
- Service startup: < 5 seconds
- Database creation: < 2 seconds
- Shell integration: < 1 second
