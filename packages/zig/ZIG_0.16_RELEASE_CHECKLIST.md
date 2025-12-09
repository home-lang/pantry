# Zig 0.16 Stable Release Checklist

Comprehensive checklist for migrating to Zig 0.16 stable and testing all new features.

## Pre-Migration

- [ ] **Backup current working binary**
  ```bash
  cp zig-out/bin/pantry zig-out/bin/pantry.backup-0.15
  ```

- [ ] **Verify backup works**
  ```bash
  ./zig-out/bin/pantry.backup-0.15 --version
  ```

- [ ] **Create migration branch**
  ```bash
  git checkout -b zig-0.16-migration
  ```

---

## Phase 1: Zig Upgrade

- [ ] **Install Zig 0.16 stable**
  ```bash
  # Update Zig installation
  brew upgrade zig  # macOS
  # or download from https://ziglang.org/download/
  ```

- [ ] **Verify Zig version**
  ```bash
  zig version
  # Should show 0.16.0 (stable)
  ```

- [ ] **Update build.zig.zon if needed**
  - Check for Zig package updates
  - Update version constraints

---

## Phase 2: API Migration (13 Errors to Fix)

Reference: `ZIG_0.16_MIGRATION.md` for detailed fix patterns.

### File I/O API Changes

- [ ] **Fix File.readToEndAlloc() → Io-based Reader (4+ locations)**
  - [ ] `src/shell/integration.zig`
  - [ ] `src/cli/commands/install/workspace.zig`
  - [ ] `src/packages/publish.zig`
  - [ ] `src/packages/workspace_deps.zig`

  **Fix Pattern:**
  ```zig
  // Old:
  const content = try file.readToEndAlloc(allocator, max_size);

  // New:
  var io = Io.init();
  const reader = try io.file.reader(file);
  const content = try reader.readAllAlloc(allocator, max_size);
  ```

- [ ] **Fix File.readAll() → Io-based Reader (1 location)**
  - [ ] `src/auth/signing.zig:76`

  **Fix Pattern:**
  ```zig
  // Old:
  const bytes_read = try file.readAll(buffer);

  // New:
  var io = Io.init();
  const reader = try io.file.reader(file);
  const bytes_read = try reader.readAll(buffer);
  ```

### Dir API Changes

- [ ] **Fix Dir.AccessOptions.mode removed (1 location)**
  - [ ] `src/cli/commands/install/workspace.zig:291`

  **Fix Pattern:**
  ```zig
  // Old:
  try dir.access("file", .{ .mode = .read_only });

  // New:
  try dir.access("file", .{}); // mode parameter removed
  ```

### Timestamp API Changes

- [ ] **Fix Io.Timestamp type (1 location)**
  - [ ] `src/cache/env_cache.zig:71`

  **Fix Pattern:**
  ```zig
  // Old:
  const timestamp: Io.Timestamp = stat.mtime;

  // New:
  const timestamp = stat.mtime.ns();
  ```

### Module Threading

- [ ] **Thread Io through auth modules (2 locations)**
  - [ ] `src/auth/auth.zig:45` - Add io field to struct
  - [ ] `src/auth/auth.zig:71` - Pass io to signing functions

  **Fix Pattern:**
  ```zig
  // Auth struct needs io field:
  pub const Auth = struct {
      allocator: std.mem.Allocator,
      io: Io,  // Add this

      pub fn init(allocator: std.mem.Allocator) Auth {
          return .{
              .allocator = allocator,
              .io = Io.init(),  // Initialize
          };
      }
  };
  ```

- [ ] **Fix signing.zig memory lifetime (1 location)**
  - [ ] `src/auth/signing.zig:158`

  **Fix Pattern:**
  ```zig
  // Old:
  return &signature;  // Returns address of local

  // New:
  const sig_copy = try allocator.dupe(u8, &signature);
  return sig_copy;  // Return owned copy
  ```

### Build System

- [ ] **Update build.zig if needed**
  - Check for breaking changes in build API
  - Update version detection logic if needed

---

## Phase 3: Compilation

- [ ] **Clean build**
  ```bash
  rm -rf zig-out/ zig-cache/
  ```

- [ ] **Attempt first build**
  ```bash
  zig build 2>&1 | tee build-errors.log
  ```

- [ ] **Fix any remaining errors**
  - Review build-errors.log
  - Apply fixes from migration guide
  - Document any new issues

- [ ] **Successful compilation**
  ```bash
  zig build
  # Should complete without errors
  ```

- [ ] **Verify binary created**
  ```bash
  ls -lh zig-out/bin/pantry
  ./zig-out/bin/pantry --version
  ```

---

## Phase 4: Feature Testing

### 1. Package Signing & Verification

- [ ] **Generate keypair**
  ```bash
  ./zig-out/bin/pantry generate-key
  ```
  - [ ] Verify public key output
  - [ ] Verify private key output
  - [ ] Keys are valid Ed25519 format

- [ ] **Create test package**
  ```bash
  mkdir test-pkg
  echo "test" > test-pkg/README.md
  tar -czf test-pkg.tar.gz test-pkg/
  ```

- [ ] **Sign package**
  ```bash
  ./zig-out/bin/pantry sign test-pkg.tar.gz <private-key>
  ```
  - [ ] Signature file created
  - [ ] Signature file is valid JSON
  - [ ] Contains correct fields (version, algorithm, signature, etc.)

- [ ] **Setup keyring**
  ```bash
  mkdir -p ~/.pantry
  echo '{"test": "ed25519:..."}' > ~/.pantry/keyring.json
  ```

- [ ] **Verify package**
  ```bash
  ./zig-out/bin/pantry verify test-pkg.tar.gz
  ```
  - [ ] Valid signature passes
  - [ ] Invalid signature fails
  - [ ] Missing keyring gives helpful error

### 2. Project Initialization

- [ ] **Initialize basic project**
  ```bash
  cd /tmp/test-init-basic
  ../../pantry/packages/zig/zig-out/bin/pantry init
  ```
  - [ ] Interactive prompts work
  - [ ] pantry.json created
  - [ ] Correct basic template
  - [ ] Overwrite protection works

- [ ] **Initialize TypeScript project**
  ```bash
  cd /tmp/test-init-ts
  touch tsconfig.json
  ../../pantry/packages/zig/zig-out/bin/pantry init
  ```
  - [ ] Detects TypeScript project
  - [ ] Uses Node/TS template
  - [ ] Includes bun dependency
  - [ ] Includes TypeScript scripts

### 3. Dependency Tree Visualization

- [ ] **Basic tree**
  ```bash
  cd /tmp/pantry-test
  ../pantry/packages/zig/zig-out/bin/pantry tree
  ```
  - [ ] Tree displays correctly
  - [ ] Unicode box drawing works
  - [ ] Colors display correctly
  - [ ] Legend shows

- [ ] **Tree options**
  ```bash
  pantry tree --no-versions
  pantry tree --no-dev
  pantry tree --peer
  pantry tree --depth=2
  ```
  - [ ] --no-versions hides versions
  - [ ] --no-dev filters dev deps
  - [ ] --peer shows peer deps
  - [ ] --depth limits tree depth

- [ ] **JSON output**
  ```bash
  pantry tree --json > tree.json
  ```
  - [ ] Valid JSON output
  - [ ] Correct structure
  - [ ] All dependencies included

### 4. Offline Mode

- [ ] **Setup test project with cached packages**
  ```bash
  cd /tmp/test-offline
  pantry init
  pantry add bun@1.3.0
  pantry install  # Populate cache
  ```

- [ ] **Enable offline mode**
  ```bash
  export PANTRY_OFFLINE=1
  ```

- [ ] **Install from cache**
  ```bash
  rm -rf pantry
  pantry install
  ```
  - [ ] Installs from cache
  - [ ] Shows offline mode message
  - [ ] No network requests made

- [ ] **Attempt uncached package**
  ```bash
  pantry add react@18.2.0
  pantry install
  ```
  - [ ] Fails gracefully
  - [ ] Shows helpful error message
  - [ ] Suggests solutions

### 5. Proxy Support

- [ ] **Test HTTP proxy**
  ```bash
  export HTTP_PROXY=http://localhost:8888
  pantry install --verbose
  ```
  - [ ] Respects HTTP_PROXY
  - [ ] Verbose shows proxy usage

- [ ] **Test HTTPS proxy**
  ```bash
  export HTTPS_PROXY=https://localhost:8888
  pantry install --verbose
  ```
  - [ ] Respects HTTPS_PROXY
  - [ ] Works with HTTPS URLs

- [ ] **Test NO_PROXY**
  ```bash
  export NO_PROXY=localhost,127.0.0.1
  pantry install --verbose
  ```
  - [ ] Bypasses proxy for listed hosts
  - [ ] Verbose confirms bypass

### 6. Error Recovery

- [ ] **Network error**
  ```bash
  # Disconnect network
  pantry install
  ```
  - [ ] Shows network error message
  - [ ] Suggests offline mode
  - [ ] Suggests proxy check

- [ ] **Permission error**
  ```bash
  # Try to write to protected directory
  pantry install --global
  ```
  - [ ] Shows permission error
  - [ ] Suggests sudo/permissions
  - [ ] Suggests --user flag

- [ ] **Disk space error**
  ```bash
  # Fill up disk (careful!)
  pantry install
  ```
  - [ ] Detects disk space issue
  - [ ] Suggests cache clear
  - [ ] Suggests df -h

- [ ] **Rollback on failure**
  ```bash
  # Cause installation to fail mid-way
  pantry install
  ```
  - [ ] Checkpoint created
  - [ ] Rollback triggered
  - [ ] Files cleaned up
  - [ ] Helpful message shown

### 7. Existing Features Regression Testing

- [ ] **Basic install**
  ```bash
  pantry install
  ```
  - [ ] Installs packages correctly
  - [ ] Creates pantry
  - [ ] Lockfile updated

- [ ] **Add package**
  ```bash
  pantry add typescript@5.0.0
  ```
  - [ ] Installs package
  - [ ] Updates pantry.json
  - [ ] Updates lockfile

- [ ] **Remove package**
  ```bash
  pantry remove typescript
  ```
  - [ ] Removes package
  - [ ] Updates pantry.json
  - [ ] Updates lockfile

- [ ] **Workspace support**
  ```bash
  cd /tmp/test-workspace
  pantry install
  ```
  - [ ] Detects workspace
  - [ ] Installs all workspace members
  - [ ] Handles workspace deps

- [ ] **Global install**
  ```bash
  pantry install --global bun@1.3.0
  ```
  - [ ] Installs globally
  - [ ] Accessible system-wide

- [ ] **Service management**
  ```bash
  pantry services
  pantry start redis
  pantry status redis
  pantry stop redis
  ```
  - [ ] Lists services
  - [ ] Starts service
  - [ ] Shows status
  - [ ] Stops service

---

## Phase 5: Performance Testing

- [ ] **Benchmark fresh install**
  ```bash
  hyperfine --warmup 3 'pantry install'
  ```
  - [ ] Record time
  - [ ] Compare to backup binary
  - [ ] Should be similar or better

- [ ] **Benchmark cached install**
  ```bash
  hyperfine --warmup 3 'pantry install'
  ```
  - [ ] Record time
  - [ ] Verify cache performance
  - [ ] <50ms for cache hits

- [ ] **Memory usage**
  ```bash
  /usr/bin/time -l pantry install
  ```
  - [ ] Record peak memory
  - [ ] Should be <20MB

- [ ] **Binary size**
  ```bash
  ls -lh zig-out/bin/pantry
  ```
  - [ ] Record size
  - [ ] ReleaseSmall: ~3-4MB
  - [ ] ReleaseFast: ~4-5MB

---

## Phase 6: Documentation

- [ ] **Update README.md**
  - [ ] Remove "won't compile yet" warnings
  - [ ] Add Zig 0.16 to requirements
  - [ ] Update build instructions if needed

- [ ] **Update FEATURE_SUMMARY.md**
  - [ ] Mark migration as complete
  - [ ] Document any API changes made
  - [ ] Update status to "Production Ready"

- [ ] **Archive ZIG_0.16_MIGRATION.md**
  - [ ] Move to `docs/archive/` or similar
  - [ ] Add "COMPLETED" marker
  - [ ] Keep for historical reference

---

## Phase 7: Release

- [ ] **Run full test suite**
  ```bash
  zig build test
  ```
  - [ ] All tests pass
  - [ ] No new warnings

- [ ] **Generate coverage report**
  ```bash
  zig build coverage
  ```
  - [ ] Review coverage
  - [ ] Ensure >80% coverage maintained

- [ ] **Build optimized binaries**
  ```bash
  # ReleaseSmall for size
  zig build -Doptimize=ReleaseSmall -Dstrip=true

  # ReleaseFast for performance
  zig build -Doptimize=ReleaseFast
  ```
  - [ ] Both build successfully
  - [ ] Test both binaries
  - [ ] Choose appropriate for release

- [ ] **Create release notes**
  - [ ] List all new features
  - [ ] Document breaking changes
  - [ ] Include migration guide if needed
  - [ ] Highlight performance improvements

- [ ] **Tag release**
  ```bash
  git tag -a v0.8.0 -m "Zig 0.16 stable + new features"
  git push origin v0.8.0
  ```

- [ ] **Publish binaries**
  - [ ] GitHub releases
  - [ ] Package registries if applicable
  - [ ] Update installation instructions

---

## Post-Release

- [ ] **Monitor for issues**
  - Watch GitHub issues
  - Check CI/CD pipelines
  - Monitor user feedback

- [ ] **Update documentation site**
  - [ ] API docs
  - [ ] Usage examples
  - [ ] Migration guides

- [ ] **Announce release**
  - [ ] Blog post / changelog
  - [ ] Social media
  - [ ] Community channels

---

## Rollback Plan

If critical issues are found:

1. **Revert to backup binary**
   ```bash
   cp zig-out/bin/pantry.backup-0.15 zig-out/bin/pantry
   ```

2. **Revert git changes**
   ```bash
   git checkout main
   git branch -D zig-0.16-migration
   ```

3. **Document issues**
   - Create GitHub issues for problems found
   - Update migration guide with gotchas
   - Plan fixes for next attempt

4. **Communicate status**
   - Update users on delay
   - Provide timeline for fixes
   - Offer workarounds if available

---

## Success Criteria

- [✓] All 13 Zig compatibility errors fixed
- [✓] Clean compilation with no warnings
- [✓] All 5 new commands working correctly
- [✓] Offline mode functioning as expected
- [✓] Recovery system working properly
- [✓] All existing features still working (regression-free)
- [✓] Performance maintained or improved
- [✓] Documentation updated
- [✓] Tests passing
- [✓] Ready for production use

---

## Notes

Track any issues or gotchas discovered during migration:

-

---

**Estimated Time:** 4-6 hours (depending on API complexity)

**Priority:** High - Blocks production deployment of new features

**Owner:** [Assignee name]

**Status:** 🟡 Waiting for Zig 0.16 Stable Release
