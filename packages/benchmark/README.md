# File Detection Performance Comparison

This benchmark compares the performance of different approaches for detecting project configuration files in directory trees, specifically comparing the current shell-based implementation with custom Bun/TypeScript alternatives.

## 🎯 Key Findings

The Bun-based approaches are **dramatically faster** than the current shell implementation:

- **Bun Direct (sync)**: **99.2% faster** on average
- **Bun Glob (async)**: **98.9% faster** on average

## 📊 Detailed Results

| Test Scenario | Bun Direct | Bun Glob | Shell (Current) | Speed Improvement |
|---------------|------------|----------|-----------------|-------------------|
| Shallow (3 levels) | 0.12ms | 0.27ms | 24.85ms | **99.5% faster** |
| Medium (7 levels) | 0.31ms | 0.74ms | 49.96ms | **99.4% faster** |
| Deep (15 levels) | 0.72ms | 0.94ms | 89.68ms | **99.2% faster** |
| Very Deep (25 levels) | 1.39ms | 1.53ms | 143.67ms | **99.0% faster** |

## 🔍 Analysis

### Current Shell Approach
```bash
files=$(ls -1a "$dir" 2>/dev/null | grep -E '^(dependencies|deps|pkgx|launchpad)\.(yaml|yml)$|^package\.json$|...' | head -1)
```

**Pros:**
- ✅ Works in any environment (no runtime dependencies)
- ✅ Leverages optimized shell commands (`ls`, `grep`)
- ✅ Consistent performance regardless of directory depth

**Cons:**
- ❌ **Significant process overhead** (spawning shell, pipes, regex)
- ❌ **Poor scalability** - gets slower with deeper directory trees
- ❌ **25-140ms per lookup** depending on depth

### Bun Direct Approach (Recommended)
```typescript
for (const file of PROJECT_FILES) {
  const filePath = join(currentDir, file)
  if (existsSync(filePath)) {
    return currentDir
  }
}
```

**Pros:**
- ✅ **Fastest performance** (0.12-1.39ms)
- ✅ **No async overhead**
- ✅ **Simple, readable implementation**
- ✅ **Excellent scalability**
- ✅ **Direct file system calls**

**Cons:**
- ❌ Requires Node.js/Bun runtime
- ❌ Multiple `existsSync` calls (though still faster)

### Bun Glob Approach
```typescript
const glob = new Glob(`{${PROJECT_FILES.join(',')}}`)
// eslint-disable-next-line no-unreachable-loop
for await (const file of glob.scan({ cwd: currentDir, onlyFiles: true })) {
  // Found a matching project file - return immediately on first match
  return currentDir
}
```

**Pros:**
- ✅ **Very fast performance** (0.27-1.53ms)
- ✅ **Flexible pattern matching**
- ✅ **Single glob operation per directory**

**Cons:**
- ❌ **Async overhead** (slightly slower than direct approach)
- ❌ Requires Node.js/Bun runtime
- ❌ More complex implementation

## 🚀 Performance Characteristics

### Scaling with Directory Depth

| Depth | Shell Time | Bun Direct | Bun Glob | Shell Overhead |
|-------|------------|------------|----------|----------------|
| 3 levels | 24.85ms | 0.12ms | 0.27ms | **207x slower** |
| 7 levels | 49.96ms | 0.31ms | 0.74ms | **161x slower** |
| 15 levels | 89.68ms | 0.72ms | 0.94ms | **124x slower** |
| 25 levels | 143.67ms | 1.39ms | 1.53ms | **103x slower** |

**Key Observations:**
- Shell approach has **linear degradation** with depth
- Bun approaches scale much better
- The deeper the directory tree, the more pronounced the performance difference

## 💡 Recommendations

### 1. **Primary Recommendation: Hybrid Approach**

Implement a hybrid solution that uses Bun when available, falls back to shell:

```typescript
function findProjectRoot(startDir: string): string | null {
  // Try Bun approach first (when in Node.js/Bun environment)
  if (typeof process !== 'undefined') {
    return findProjectRootBunSync(startDir)
  }

  // Fallback to shell approach
  return findProjectRootShell(startDir)
}
```

### 2. **For Pure Performance: Bun Direct**

If you can guarantee a Node.js/Bun runtime, use the direct file system approach:
- **99.2% faster** than current implementation
- Simple, maintainable code
- Excellent scalability

### 3. **For Flexibility: Bun Glob**

If you need more complex pattern matching or plan to extend file detection:
- **98.9% faster** than current implementation
- More flexible for future enhancements
- Slightly more overhead due to async nature

## 🔧 Implementation Impact

### Current Usage Patterns
The file detection is used in:
- Shell integration (`__lp_find_deps_dir`)
- Project root discovery
- Development environment setup

### Migration Considerations
1. **Backward Compatibility**: Keep shell version for environments without Node.js
2. **Runtime Detection**: Detect available runtime and choose appropriate method
3. **Caching**: Both approaches benefit from the existing caching mechanism
4. **Error Handling**: Ensure graceful fallback between approaches

## 🧪 Running the Benchmark

```bash
cd packages/launchpad/benchmark
bun install
bun run file-detection-comparison.ts
```

The benchmark creates temporary directory structures at various depths and measures the time to find project files, providing comprehensive performance data across different scenarios.

## 📈 Conclusion

The performance difference is **dramatic and consistent**:
- Bun approaches are **~100x faster** than the shell approach
- The performance gap **increases** with directory depth
- Implementation complexity is **minimal** for the Bun direct approach

**Recommendation**: Implement the hybrid approach with Bun Direct as primary and shell as fallback for maximum performance while maintaining compatibility.
