#!/usr/bin/env bun

// Build Package from Source
// Reads package metadata from src/packages and build instructions from src/pantry
// Uses buildkit to generate bash build scripts from YAML recipes (like brewkit)

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { execSync, spawn } from 'node:child_process'
import { join, dirname } from 'node:path'
import { parseArgs } from 'node:util'
import { generateBuildScript, getSkips } from './buildkit.ts'
import { fixUp } from './fix-up.ts'

/**
 * Find the system prefix for a dependency by detecting where its binary lives.
 * For example, if `cargo` is at `/home/runner/.cargo/bin/cargo`, returns `/home/runner/.cargo`.
 * Falls back to /usr/local or /usr if binary not found.
 */
function findSystemPrefix(domain: string): string {
  // Full domain -> binary name mappings
  const domainMap: Record<string, string> = {
    'go.dev': 'go', 'python.org': 'python3', 'cmake.org': 'cmake',
    'nodejs.org': 'node', 'mesonbuild.com': 'meson', 'ninja-build.org': 'ninja',
    'rust-lang.org/cargo': 'cargo', 'rust-lang.org/rustup': 'rustup',
    'openssl.org': 'openssl', 'curl.se': 'curl', 'gnu.org/make': 'make',
    'gnu.org/autoconf': 'autoconf', 'gnu.org/automake': 'automake',
    'gnu.org/libtool': 'libtool', 'perl.org': 'perl', 'ruby-lang.org': 'ruby',
    'openjdk.org': 'java', 'adoptium.net': 'java',
  }
  // Extract likely binary name from domain
  const lastPart = domain.split('/').pop() || ''
  const binaryName = domainMap[domain] || domainMap[lastPart] || lastPart
  try {
    const whichPath = execSync(`command -v ${binaryName} 2>/dev/null`, { encoding: 'utf-8' }).trim()
    if (whichPath && existsSync(whichPath)) {
      // Binary at /X/Y/bin/name → prefix is /X/Y
      const binDir = dirname(whichPath)
      const prefix = dirname(binDir)
      // Sanity check: prefix should have a bin directory
      if (binDir.endsWith('/bin') || binDir.endsWith('/sbin')) {
        return prefix
      }
    }
  } catch { /* binary not found */ }
  return existsSync('/usr/local/include') ? '/usr/local' : '/usr'
}
// Import package metadata
const packagesPath = new URL('../src/packages/index.ts', import.meta.url).pathname
// eslint-disable-next-line ts/no-top-level-await
const { pantry } = await import(packagesPath)

// Check if a trimmed line looks like a YAML key-value pair (key: value)
// Returns false for lines that are pure URLs (e.g. "https://example.com/path")
function looksLikeKeyValue(trimmedLine: string): boolean {
  const colonIdx = trimmedLine.indexOf(':')
  if (colonIdx < 0) return false
  // If the first colon is followed by // it's a URL scheme, not a key-value pair
  if (trimmedLine[colonIdx + 1] === '/' && trimmedLine[colonIdx + 2] === '/') return false
  // A YAML key should be followed by `: ` (colon+space) or `:\n` (colon at end)
  const afterColon = trimmedLine[colonIdx + 1]
  if (afterColon !== undefined && afterColon !== ' ' && afterColon !== '\t') return false
  // The key part should look like a valid YAML key (alphanumeric, hyphens, dots, slashes)
  const key = trimmedLine.slice(0, colonIdx).trim()
  if (!key || /[{}[\]]/.test(key)) return false
  return true
}

// Strip YAML inline comments: ` #comment` or ` # comment` at end of value
// Only strips when # is preceded by a space (YAML spec: not inside quoted strings, not in URLs)
function stripYamlComment(val: string): string {
  // Don't strip from quoted strings
  if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) return val
  // Find ` #` pattern — must be preceded by a space
  const idx = val.indexOf(' #')
  if (idx < 0) return val
  // Make sure this isn't inside a URL (e.g. https://foo.com#anchor has no space before #)
  return val.slice(0, idx).trim()
}

// Parse a YAML value that follows a key: — handles block scalars (|), arrays (- item), or plain strings
// For `run:` keys, also detects YAML arrays (lines starting with `- `)
// Returns the value, or { value, _newIndex } if it advanced the line pointer
function parseYamlValue(
  rawVal: string,
  lines: string[],
  currentLineIdx: number,
  blockIndent: number,
  canBeArray: boolean = false,
): any {
  if (rawVal === '|' || rawVal === '|-') {
    // Block scalar — detect actual content indent from first content line
    // This prevents sibling keys (working-directory:, if:) from being consumed
    let j = currentLineIdx + 1
    // Skip empty lines to find first content line
    while (j < lines.length && !lines[j].trim()) j++
    const actualIndent = j < lines.length ? lines[j].search(/\S/) : blockIndent
    // Use the higher of blockIndent or actualIndent (actual content is typically further indented)
    const effectiveIndent = Math.max(blockIndent, actualIndent)
    const blockLines: string[] = []
    j = currentLineIdx + 1
    while (j < lines.length) {
      const bl = lines[j]
      const bli = bl.search(/\S/)
      if (bl.trim() === '' || bli >= effectiveIndent) {
        blockLines.push(bl.slice(effectiveIndent) || '')
        j++
      } else break
    }
    return { value: blockLines.join('\n').trim(), _newIndex: j - 1 }
  }

  if (rawVal === '' && canBeArray) {
    // Peek at next non-empty line to detect if it's a YAML array
    let peekJ = currentLineIdx + 1
    while (peekJ < lines.length && (!lines[peekJ].trim() || lines[peekJ].trim().startsWith('#'))) peekJ++
    const firstContent = peekJ < lines.length ? lines[peekJ] : ''
    const firstTrimmed = firstContent.trim()
    const firstIndent = firstContent.search(/\S/)

    if (firstTrimmed.startsWith('- ') && firstIndent >= blockIndent) {
      // It's a YAML array under run: — parse list items
      const runArr: string[] = []
      let j = peekJ
      while (j < lines.length) {
        const bl = lines[j]
        const blt = bl.trim()
        if (!blt || blt.startsWith('#')) { j++; continue }
        const bli = bl.search(/\S/)
        if (bli >= blockIndent && blt.startsWith('- ')) {
          const itemContent = blt.slice(2)
          if (itemContent.trimStart().startsWith('|')) {
            // Multi-line block scalar item (- |)
            const mlLines: string[] = []
            const mlIndent = bli + 2
            j++
            while (j < lines.length) {
              const ml = lines[j]
              const mli = ml.search(/\S/)
              if (ml.trim() === '' || mli >= mlIndent) { mlLines.push(ml.slice(mlIndent) || ''); j++ } else break
            }
            runArr.push(mlLines.join('\n').trim())
          } else {
            runArr.push(itemContent)
            j++
          }
        } else if (bli > blockIndent && !blt.startsWith('- ')) {
          // Continuation of previous item
          if (runArr.length > 0) runArr[runArr.length - 1] += '\n' + blt
          j++
        } else break
      }
      return { value: runArr, _newIndex: j - 1 }
    }
  }

  if (rawVal === '') {
    // Multi-line block without | marker
    const blockLines: string[] = []
    let j = currentLineIdx + 1
    while (j < lines.length) {
      const bl = lines[j]
      const bli = bl.search(/\S/)
      if (bl.trim() === '' || bli >= blockIndent) {
        blockLines.push(bl.slice(blockIndent) || '')
        j++
      } else break
    }
    const joined = blockLines.join('\n').trim()
    if (joined) return { value: joined, _newIndex: j - 1 }
    return ''
  }

  // Plain inline value — strip YAML inline comments
  let val = stripYamlComment(rawVal)
  if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
  return val
}

// Simple YAML parser for package.yml files
function parseYaml(content: string): Record<string, any> {
  const result: Record<string, any> = {}
  const lines = content.split('\n')
  // Stack now stores the actual object to add properties to
  const stack: { indent: number; obj: any }[] = [{ indent: -1, obj: result }]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue

    // Calculate indentation
    const indent = line.search(/\S/)

    // Pop stack to correct indent level
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }

    const currentObj = stack[stack.length - 1].obj

    // Check if it's a list item
    if (trimmed.startsWith('- ')) {
      const value = trimmed.slice(2).trim()

      // Find the array in the parent - it should be the current object if it's an array
      if (Array.isArray(currentObj)) {
        // Check if this list item is an object-style entry (has a key: value)
        const firstColonIdx = value.indexOf(':')
        // Only treat as object item if key looks like a YAML key (lowercase, starts with letter)
        // This avoids misinterpreting `-DCMAKE_FOO:BOOL=ON` as a key-value pair
        const isObjectItem = firstColonIdx > 0 && /^[a-z][a-z0-9-]*$/.test(value.slice(0, firstColonIdx).trim())

        if (isObjectItem) {
          // Parse object-style list item: collect all keys at this indent level
          const itemObj: Record<string, any> = {}
          const siblingIndent = indent + 2

          // Parse the first key from this line
          const firstKey = value.slice(0, firstColonIdx).trim()
          let firstVal: any = value.slice(firstColonIdx + 1).trim()

          // Handle the first key's value
          if (firstKey === 'run' || firstKey === 'if' || firstKey === 'prop') {
            firstVal = parseYamlValue(firstVal, lines, i, indent + 2, firstKey === 'run')
            if (typeof firstVal === 'object' && firstVal._newIndex !== undefined) {
              i = firstVal._newIndex
              firstVal = firstVal.value
            }
          } else {
            if (firstVal.startsWith("'") && firstVal.endsWith("'")) firstVal = firstVal.slice(1, -1)
            if (firstVal.startsWith('"') && firstVal.endsWith('"')) firstVal = firstVal.slice(1, -1)
          }
          itemObj[firstKey] = firstVal

          // Collect sibling keys at indent+2
          while (i + 1 < lines.length) {
            const nextLine = lines[i + 1]
            const nextTrimmed = nextLine.trim()
            if (!nextTrimmed || nextTrimmed.startsWith('#')) { i++; continue }
            const nextIndent = nextLine.search(/\S/)
            if (nextIndent >= siblingIndent && !nextTrimmed.startsWith('- ')) {
              const nc = nextTrimmed.indexOf(':')
              if (nc > 0) {
                const sibKey = nextTrimmed.slice(0, nc).trim()
                let sibVal: any = nextTrimmed.slice(nc + 1).trim()

                if (sibKey === 'run' || sibKey === 'prop') {
                  sibVal = parseYamlValue(sibVal, lines, i + 1, nextIndent + 2, sibKey === 'run')
                  if (typeof sibVal === 'object' && sibVal._newIndex !== undefined) {
                    i = sibVal._newIndex
                    sibVal = sibVal.value
                  } else {
                    i++
                  }
                } else {
                  if (sibVal.startsWith("'") && sibVal.endsWith("'")) sibVal = sibVal.slice(1, -1)
                  if (sibVal.startsWith('"') && sibVal.endsWith('"')) sibVal = sibVal.slice(1, -1)
                  i++
                }
                itemObj[sibKey] = sibVal
              } else break
            } else break
          }
          currentObj.push(itemObj)
        } else if (value === '|' || value === '|-') {
          // Block scalar array item: - |
          const result = parseYamlValue(value, lines, i, indent + 2, false)
          if (typeof result === 'object' && result._newIndex !== undefined) {
            i = result._newIndex
            currentObj.push(result.value)
          } else {
            currentObj.push(result)
          }
        } else {
          // Plain string item — check for continuation lines (multi-line plain scalar)
          // e.g. - ./configure
          //          --prefix="..."
          //          --disable-debug
          let fullValue = value
          const contIndent = indent + 4 // continuation lines must be indented more than `- `
          while (i + 1 < lines.length) {
            const nextLine = lines[i + 1]
            const nextTrimmed = nextLine.trim()
            if (!nextTrimmed) { i++; continue } // skip blank lines
            if (nextTrimmed.startsWith('#')) { i++; continue } // skip comments in continuation
            const nextIndent = nextLine.search(/\S/)
            if (nextIndent >= contIndent && !nextTrimmed.startsWith('- ')) {
              // Strip inline comments (# ...) from continuation lines
              const commentIdx = nextTrimmed.indexOf('  #')
              const cleanLine = commentIdx >= 0 ? nextTrimmed.slice(0, commentIdx).trim() : nextTrimmed
              fullValue += ' ' + cleanLine
              i++
            } else {
              break
            }
          }
          currentObj.push(stripYamlComment(fullValue))
        }
      }
      continue
    }

    // Key-value pair
    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue

    const key = trimmed.slice(0, colonIndex).trim()
    let value: any = trimmed.slice(colonIndex + 1).trim()

    // Handle different value types
    if (value === '' || value === '|' || value === '|-') {
      // Object or multi-line string
      if (value === '|' || value === '|-') {
        // Multi-line string block
        const blockLines: string[] = []
        let j = i + 1
        const blockIndent = indent + 2
        while (j < lines.length) {
          const blockLine = lines[j]
          const blockLineIndent = blockLine.search(/\S/)
          if (blockLine.trim() === '' || (blockLineIndent >= 0 && blockLineIndent >= blockIndent)) {
            blockLines.push(blockLine.slice(Math.min(blockIndent, blockLine.length)) || '')
            j++
          } else {
            break
          }
        }
        currentObj[key] = blockLines.join('\n').trim()
        i = j - 1
      } else {
        // Check if next non-empty, non-comment line is a list item, key-value, or plain text
        let j = i + 1
        while (j < lines.length && (lines[j].trim() === '' || lines[j].trim().startsWith('#'))) j++
        const nextLine = j < lines.length ? lines[j].trim() : ''
        const nextLineIndent = j < lines.length ? lines[j].search(/\S/) : 0

        if (nextLine.startsWith('- ')) {
          // It's an array
          currentObj[key] = []
          stack.push({ indent, obj: currentObj[key] })
        } else if (nextLineIndent > indent && looksLikeKeyValue(nextLine.trim())) {
          // It's an object (has key-value pairs)
          currentObj[key] = {}
          stack.push({ indent, obj: currentObj[key] })
        } else if (nextLineIndent > indent && nextLine) {
          // It's a plain text block (like script content without | marker)
          // Standard YAML folding: join lines with spaces (for URLs, plain values)
          const blockLines: string[] = []
          const blockIndent = nextLineIndent
          while (j < lines.length) {
            const blockLine = lines[j]
            const blockLineIndent = blockLine.search(/\S/)
            if (blockLine.trim() === '' || (blockLineIndent >= 0 && blockLineIndent >= blockIndent)) {
              blockLines.push(blockLine.trim())
              j++
            } else {
              break
            }
          }
          // Use space-join (YAML folding) for plain scalars
          currentObj[key] = blockLines.filter(l => l && !l.startsWith('#')).join(' ')
          i = j - 1
        } else {
          // Empty object
          currentObj[key] = {}
          stack.push({ indent, obj: currentObj[key] })
        }
      }
    } else if (value.startsWith('\'') && value.endsWith('\'')) {
      currentObj[key] = value.slice(1, -1)
    } else if (value.startsWith('"') && value.endsWith('"')) {
      currentObj[key] = value.slice(1, -1)
    } else if (value === 'true') {
      currentObj[key] = true
    } else if (value === 'false') {
      currentObj[key] = false
    } else if (/^\d+$/.test(value)) {
      currentObj[key] = parseInt(value, 10)
    } else if (value.startsWith('{') && value.endsWith('}')) {
      // Inline YAML flow mapping: { key: val, key: val }
      const inner = value.slice(1, -1).trim()
      const obj: Record<string, any> = {}
      // Split by comma, handling possible quoted values
      for (const pair of inner.split(',')) {
        const colonPos = pair.indexOf(':')
        if (colonPos > 0) {
          const k = pair.slice(0, colonPos).trim()
          let v: any = pair.slice(colonPos + 1).trim()
          if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
          if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1)
          if (v === 'true') v = true
          else if (v === 'false') v = false
          else if (/^\d+$/.test(v)) v = parseInt(v, 10)
          obj[k] = v
        }
      }
      currentObj[key] = obj
    } else if (value.startsWith('[') && value.endsWith(']')) {
      // Inline YAML flow sequence: [val1, val2]
      const inner = value.slice(1, -1).trim()
      currentObj[key] = inner ? inner.split(',').map((v: string) => {
        v = v.trim()
        if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1)
        if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1)
        return v
      }) : []
    } else {
      currentObj[key] = stripYamlComment(value)
    }
  }

  return result
}

interface BuildOptions {
  package: string
  version: string
  platform: string
  buildDir: string
  prefix: string
  depsDir?: string
  bucket?: string
  region?: string
}

interface PackageRecipe {
  distributable: {
    url: string
    'strip-components'?: number
    ref?: string
  }
  dependencies?: Record<string, any>
  build?: {
    dependencies?: Record<string, any>
    script?: (string | { run: string; if?: string; 'working-directory'?: string; prop?: string })[]
    env?: Record<string, any>
  }
  versions?: any
  provides?: string[]
}

// Template variable interpolation
function interpolate(template: string | any, vars: Record<string, string>): string {
  if (typeof template !== 'string') {
    return String(template)
  }
  return template
    // Handle ${{key}} first (before {{key}} to avoid partial matches)
    .replace(/\$\{\{([^}]+)\}\}/g, (_, key) => {
      const trimmedKey = key.trim()
      return vars[trimmedKey] ?? '${{' + trimmedKey + '}}'
    })
    // Handle {{key}}
    .replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const trimmedKey = key.trim()
      return vars[trimmedKey] ?? '{{' + trimmedKey + '}}'
    })
    // Handle $ENV_VAR style
    .replace(/\$([A-Z_][A-Z0-9_]*)/g, (_, key) => {
      return process.env[key] ?? vars[key] ?? '$' + key
    })
}

/**
 * Determine version.tag from the YAML versions.strip pattern
 * In pkgx, version.tag = the original git tag before strip was applied.
 * Default github strip is /^v/ (removes v prefix from tags like v1.0.0)
 * But if tag doesn't have v prefix, version = tag (strip is no-op)
 */
function determineVersionTag(yamlContent: string, version: string): string {
  // Look for explicit strip pattern in the YAML
  // Match from first / to last / on the line (handles / inside pattern like /(cli/v|...)/
  const stripMatch = yamlContent.match(/strip:\s*\/(.+)\/$/)
  const stripMatchML = stripMatch ?? yamlContent.match(/strip:\s*\/(.+)\//)
  if (stripMatchML) {
    const pattern = stripMatchML[1]

    // Handle alternation patterns like (cli/v|@biomejs/biome@)
    // Extract the first alternative as the prefix to prepend
    if (pattern.includes('|')) {
      const alts = pattern.replace(/^\(/, '').replace(/\)$/, '').split('|')
      // Use first alternative, strip leading ^
      const prefix = alts[0].replace(/^\^/, '')
      return prefix + version
    }

    // Simple prefix pattern: /^v/, /^hdf5_/, /^mysql-/
    const simplePrefix = pattern.replace(/^\^/, '')
    if (simplePrefix === 'v') return `v${version}`
    return simplePrefix + version
  }

  // No explicit strip — check if this is a github source (default strip is /^v/)
  // But we need to handle cases where tags don't have v prefix
  // Heuristic: date-based versions (YYYYMMDD...) rarely have v prefix
  if (/^\d{6,}/.test(version)) return version

  // Default: assume v prefix (most common for github releases)
  return `v${version}`
}

// Load build overrides from src/pantry/{domain}/build-overrides.json
function getBuildOverrides(pkgName: string): { description?: string; extraConfigureArgs?: string[] } | null {
  const overridesPath = join(process.cwd(), 'src', 'pantry', pkgName, 'build-overrides.json')
  if (!existsSync(overridesPath)) return null

  try {
    const content = readFileSync(overridesPath, 'utf-8')
    return JSON.parse(content)
  } catch (error: any) {
    console.log(`Warning: Failed to parse build-overrides.json for ${pkgName}: ${error.message}`)
    return null
  }
}

async function downloadSource(url: string, destDir: string, stripComponents: number = 1, ref?: string, pkgDomain?: string, pkgVersion?: string): Promise<void> {
  console.log(`📥 Downloading source from ${url}`)

  // Handle non-archive single files (.jar, .bin, etc.) — save directly, don't extract
  const nonArchiveExts = ['.jar', '.bin', '.exe', '.AppImage', '.whl', '.gem']
  let urlPath: string
  try {
    urlPath = new URL(url.replace(/ /g, '%20')).pathname
  } catch {
    urlPath = url.split('?')[0] // fallback for malformed URLs
  }
  const matchedExt = nonArchiveExts.find(ext => urlPath.endsWith(ext))
  if (matchedExt) {
    const encodedUrl = url.replace(/ /g, '%20')
    // Save with pkgx naming convention: <domain>-<version>.<ext>
    const fileName = pkgDomain && pkgVersion ? `${pkgDomain}-${pkgVersion}${matchedExt}` : urlPath.split('/').pop() || `download${matchedExt}`
    const destFile = join(destDir, fileName)
    console.log(`📦 Saving non-archive file as ${fileName}`)
    execSync(`curl -fSL --connect-timeout 30 --max-time 600 --retry 2 --retry-delay 5 -o "${destFile}" "${encodedUrl}"`, { stdio: 'inherit' })
    return
  }

  // Handle git+https:// URLs — clone the repo
  if (url.startsWith('git+https://') || url.startsWith('git+http://')) {
    const gitUrl = url.replace(/^git\+/, '')
    console.log(`📦 Cloning git repository...`)
    // Clone with specific ref/tag if provided, shallow for speed
    const refArg = ref ? `--branch "${ref}" --single-branch` : ''
    try {
      execSync(`git clone --depth 1 ${refArg} "${gitUrl}" "${destDir}/_git_clone"`, { stdio: 'inherit' })
    } catch {
      // If shallow clone with ref fails, try full clone + checkout
      try {
        execSync(`git clone "${gitUrl}" "${destDir}/_git_clone"`, { stdio: 'inherit' })
      } catch (cloneError: any) {
        const err = new Error(`DOWNLOAD_FAILED: Failed to clone ${gitUrl}`) as any
        err._downloadFailure = true
        throw err
      }
      if (ref) {
        try {
          execSync(`cd "${destDir}/_git_clone" && git checkout "${ref}"`, { stdio: 'inherit' })
        } catch {
          console.log(`Warning: Could not checkout ref ${ref}, using default branch`)
        }
      }
    }
    // Move cloned content to build dir
    execSync(`cp -a "${destDir}/_git_clone/." "${destDir}/"`, { stdio: 'pipe' })
    execSync(`rm -rf "${destDir}/_git_clone"`, { stdio: 'pipe' })
    return
  }

  // Determine file extension from URL
  const isZip = url.endsWith('.zip')
  const tempFile = join(destDir, isZip ? 'source.zip' : 'source.tar.gz')

  // Download using curl (follow redirects, fail on HTTP errors)
  // Encode spaces and special chars in URLs (e.g. xpra.org has "xpra 6.4.3" in tag)
  const encodedUrl = url.replace(/ /g, '%20')
  try {
    // --connect-timeout 30: fail fast if server doesn't respond
    // --max-time 600: abort if download takes >10 minutes (SourceForge can be very slow)
    // --retry 2 --retry-delay 5: retry on transient failures
    execSync(`curl -fSL --connect-timeout 30 --max-time 600 --retry 2 --retry-delay 5 -o "${tempFile}" "${encodedUrl}"`, { stdio: 'inherit' })
  } catch (curlError: any) {
    const err = new Error(`DOWNLOAD_FAILED: Failed to download ${url}`) as any
    err._downloadFailure = true
    throw err
  }

  // Validate downloaded file is not a tiny error page
  const fileSize = statSync(tempFile).size
  if (fileSize < 1000) {
    const err = new Error(`Downloaded file is too small (${fileSize} bytes) — likely an error page, not a source archive`) as any
    err._downloadFailure = true
    throw err
  }

  console.log(`📦 Extracting source to ${destDir}`)

  if (isZip) {
    // For zip: extract then unwrap top-level directory if strip-components > 0
    const tmpExtract = join(destDir, '__zip_extract__')
    mkdirSync(tmpExtract, { recursive: true })
    execSync(`unzip -q -o "${tempFile}" -d "${tmpExtract}"`, { stdio: 'inherit' })

    if (stripComponents > 0) {
      // Apply strip-components by unwrapping top-level directories
      let currentDir = tmpExtract
      for (let s = 0; s < stripComponents; s++) {
        const entries = execSync(`ls "${currentDir}"`, { encoding: 'utf-8' }).trim().split('\n').filter(e => e)
        if (entries.length === 1) {
          const entryPath = join(currentDir, entries[0])
          // Only strip if the single entry is a directory (not a file like a .jar)
          try {
            if (statSync(entryPath).isDirectory()) {
              currentDir = entryPath
              continue
            }
          } catch { /* stat failed, not a directory */ }
        }
        // Can't strip further (multiple entries or single file)
        break
      }
      execSync(`cp -a "${currentDir}/." "${destDir}/"`, { stdio: 'pipe' })
    } else {
      execSync(`cp -a "${tmpExtract}/." "${destDir}/"`, { stdio: 'pipe' })
    }
    execSync(`rm -rf "${tmpExtract}"`)
  } else {
    // tar auto-detects format (gz, xz, bz2, zstd)
    execSync(`tar -xf "${tempFile}" -C "${destDir}" --strip-components=${stripComponents}`, { stdio: 'inherit' })
  }

  // Remove temp file
  execSync(`rm -f "${tempFile}"`)
}

function runCommand(cmd: string, cwd: string, env: Record<string, string>): void {
  console.log(`\n🔧 Running: ${cmd.slice(0, 100)}${cmd.length > 100 ? '...' : ''}`)

  try {
    execSync(cmd, {
      cwd,
      env: { ...process.env, ...env },
      stdio: 'inherit',
      shell: '/bin/bash',
    })
  } catch (error: any) {
    console.error(`❌ Command failed: ${cmd}`)
    throw error
  }
}

function shouldRunStep(condition: string | undefined, platform: string, version: string): boolean {
  if (!condition) return true

  const [os, arch] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'

  // Platform conditions
  if (condition === 'linux' && osName !== 'linux') return false
  if (condition === 'darwin' && osName !== 'darwin') return false

  // Platform/arch conditions like "darwin/x86-64"
  if (condition.includes('/')) {
    const [condOs, condArch] = condition.split('/')
    const normalizedArch = arch === 'arm64' ? 'aarch64' : 'x86-64'
    if (condOs !== osName) return false
    if (condArch && condArch !== normalizedArch && condArch !== arch) return false
  }

  // Version conditions (simplified)
  if (condition.startsWith('<') || condition.startsWith('>') || condition.startsWith('^') || condition.startsWith('~')) {
    // For now, assume version conditions pass (can be enhanced later)
    return true
  }

  return true
}

// Convert domain to pantry key (php.net -> phpnet)
function domainToKey(domain: string): string {
  return domain.replace(/[.\-/]/g, '').toLowerCase()
}

// Extract dependency domains from YAML build.dependencies object
// Handles both flat: { "domain.com": ">=1.0" } and platform-specific: { linux: { "domain.com": "*" } }
function extractYamlDeps(depsObj: any, platform: string): string[] {
  if (!depsObj || typeof depsObj !== 'object') return []
  const [os] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'
  const deps: string[] = []

  for (const [key, value] of Object.entries(depsObj)) {
    // Check if this is a platform key (darwin, linux, darwin/aarch64)
    if (/^(darwin|linux)(\/.*)?$/.test(key)) {
      // Only include deps from matching platform
      const [condOs] = key.split('/')
      if (condOs === osName && typeof value === 'object' && value !== null) {
        for (const [subKey] of Object.entries(value)) {
          if (subKey.includes('.') || subKey.includes('/')) {
            deps.push(subKey)
          }
        }
      }
    } else if (key.includes('.') || key.includes('/')) {
      // Regular dependency domain
      deps.push(key)
    }
  }
  return deps
}

// Parse dependency string to get domain
function parseDep(dep: string): string {
  let domain = dep
  // Remove platform prefix
  if (domain.includes(':')) {
    domain = domain.split(':')[1]
  }
  // Remove version constraints
  domain = domain.replace(/[\^~<>=@].*$/, '')
  // Remove comments
  domain = domain.replace(/#.*$/, '').trim()
  return domain
}

// Download dependencies from S3
async function downloadDependencies(
  dependencies: string[],
  depsDir: string,
  platform: string,
  bucket: string,
  region: string
): Promise<Record<string, string>> {
  const { S3Client } = await import('@stacksjs/ts-cloud/aws')
  const s3 = new S3Client(region)
  const depPaths: Record<string, string> = {}
  const platformOs = platform.split('-')[0]

  console.log(`\nDownloading ${dependencies.length} dependencies from S3...`)

  for (const dep of dependencies) {
    // Skip platform-specific deps for other platforms
    if (dep.includes(':')) {
      const [depPlatform] = dep.split(':')
      if (depPlatform === 'linux' && platformOs === 'darwin') continue
      if (depPlatform === 'darwin' && platformOs === 'linux') continue
    }

    const domain = parseDep(dep)
    if (!domain || domain.match(/^(darwin|linux)\//)) continue

    try {
      // Get metadata to find latest version
      const metadataKey = `binaries/${domain}/metadata.json`
      let metadata: any

      try {
        const metadataContent = await s3.getObject(bucket, metadataKey)
        metadata = JSON.parse(metadataContent)
      } catch {
        console.log(`   - ${domain}: not in S3, falling back to system path`)
        // Still register the dep with a system fallback so {{deps.*.prefix}} templates resolve
        const fallbackPrefix = findSystemPrefix(domain)
        depPaths[domain] = fallbackPrefix
        depPaths[`deps.${domain}.prefix`] = fallbackPrefix
        continue
      }

      const version = metadata.latestVersion
      const platformInfo = metadata.versions?.[version]?.platforms?.[platform]

      if (!platformInfo) {
        console.log(`   - ${domain}@${version}: no binary for ${platform}, falling back to system path`)
        const fallbackPrefix = findSystemPrefix(domain)
        depPaths[domain] = fallbackPrefix
        depPaths[`deps.${domain}.prefix`] = fallbackPrefix
        continue
      }

      // Download and extract
      const depInstallDir = join(depsDir, domain, version)
      mkdirSync(depInstallDir, { recursive: true })

      console.log(`   - ${domain}@${version}`)

      const tarballPath = join(depInstallDir, 'package.tar.gz')

      // Use curl to download binary data from S3 (s3.getObject returns string which corrupts binaries)
      const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${platformInfo.tarball}`
      try {
        // Try AWS CLI first (available on GitHub runners, handles auth properly)
        execSync(`aws s3 cp "s3://${bucket}/${platformInfo.tarball}" "${tarballPath}" --region ${region}`, { stdio: 'pipe' })
      } catch {
        // Fallback: try direct HTTP (works if bucket allows public reads)
        execSync(`curl -fsSL -o "${tarballPath}" "${s3Url}"`, { stdio: 'pipe' })
      }

      // Use tar -xf (auto-detect format) instead of -xzf (gzip only)
      execSync(`tar -xf "${tarballPath}" -C "${depInstallDir}"`, { stdio: 'pipe' })
      execSync(`rm "${tarballPath}"`)

      // Fix pkg-config files in downloaded deps — replace hardcoded build-time prefixes
      // with the actual dep install path so pkg-config works correctly
      const pcDir = join(depInstallDir, 'lib', 'pkgconfig')
      if (existsSync(pcDir)) {
        try {
          const pcFiles = readdirSync(pcDir).filter(f => f.endsWith('.pc'))
          for (const pcFile of pcFiles) {
            const pcPath = join(pcDir, pcFile)
            let content = readFileSync(pcPath, 'utf-8')
            // Replace any hardcoded /tmp/buildkit-install-* prefix with actual dep path
            const replaced = content.replace(/\/tmp\/buildkit-install-[^\s/]+(\/[^\s]*)?/g, (match) => {
              // Extract the relative path part after the prefix
              const afterPrefix = match.replace(/^\/tmp\/buildkit-install-[^\s/]+/, '')
              return depInstallDir + afterPrefix
            })
            if (replaced !== content) {
              writeFileSync(pcPath, replaced)
            }
          }
        } catch { /* ignore pkg-config fix errors */ }
      }

      depPaths[domain] = depInstallDir
      depPaths[`deps.${domain}.prefix`] = depInstallDir
      // Add version-related template variables for this dependency
      const depV = String(version)
      const depVParts = depV.split('.')
      depPaths[`deps.${domain}.version`] = depV
      depPaths[`deps.${domain}.version.major`] = depVParts[0] || '0'
      depPaths[`deps.${domain}.version.minor`] = depVParts[1] || '0'
      depPaths[`deps.${domain}.version.patch`] = depVParts[2] || '0'
      depPaths[`deps.${domain}.version.marketing`] = `${depVParts[0] || '0'}.${depVParts[1] || '0'}`

      // Fix meson: the S3 meson has a broken venv with hardcoded python3 paths.
      // Replace with a wrapper that uses system meson or system python3.
      if (domain === 'mesonbuild.com') {
        try {
          const mesonBin = join(depInstallDir, 'bin', 'meson')
          if (existsSync(mesonBin)) {
            // Test if the meson binary actually works
            let mesonWorks = false
            try {
              execSync(`"${mesonBin}" --version`, { stdio: 'pipe', timeout: 5000 })
              mesonWorks = true
            } catch { /* broken venv */ }

            if (!mesonWorks) {
              // Check if system meson exists (installed via apt/brew in CI)
              let systemMeson = ''
              try {
                systemMeson = execSync('which meson', { encoding: 'utf-8', stdio: 'pipe' }).trim()
              } catch { /* not found */ }

              if (systemMeson) {
                // Replace with wrapper that calls system meson
                writeFileSync(mesonBin, `#!/bin/sh\nexec "${systemMeson}" "$@"\n`, { mode: 0o755 })
                console.log(`   - Replaced broken meson with system meson wrapper`)
              } else {
                // Try to fix the shebang to use system python3
                const mesonContent = readFileSync(mesonBin, 'utf-8')
                const fixedContent = mesonContent.replace(/^#!.*/, '#!/usr/bin/env python3')
                writeFileSync(mesonBin, fixedContent, { mode: 0o755 })
                console.log(`   - Fixed meson shebang to use system python3`)
              }
            }
          }
        } catch (e: any) {
          console.log(`   - Warning: Could not fix meson: ${e.message}`)
        }
      }

    } catch (error: any) {
      console.log(`   - ${domain}: failed (${error.message})`)
    }
  }

  return depPaths
}

async function buildPackage(options: BuildOptions): Promise<void> {
  const { package: pkgName, version, platform, buildDir, prefix, depsDir, bucket, region } = options
  const [os, arch] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Building ${pkgName} ${version} for ${platform}`)
  console.log(`${'='.repeat(60)}`)

  // Get package metadata from src/packages/*.ts
  const pkgKey = domainToKey(pkgName)
  const pkg = (pantry as Record<string, any>)[pkgKey]

  if (!pkg) {
    throw new Error(`Package not found in src/packages: ${pkgName} (key: ${pkgKey})`)
  }

  console.log(`\nPackage: ${pkg.name} (${pkg.domain})`)
  console.log(`Description: ${pkg.description}`)
  console.log(`Available versions: ${pkg.versions.length}`)

  // Validate version is available
  if (!pkg.versions.includes(version)) {
    console.log(`\nAvailable versions: ${pkg.versions.slice(0, 10).join(', ')}...`)
    throw new Error(`Version ${version} not found. Latest: ${pkg.versions[0]}`)
  }

  // Show dependencies
  if (pkg.dependencies?.length > 0) {
    console.log(`\nRuntime dependencies: ${pkg.dependencies.length}`)
    pkg.dependencies.slice(0, 5).forEach((d: string) => console.log(`  - ${d}`))
    if (pkg.dependencies.length > 5) console.log(`  ... and ${pkg.dependencies.length - 5} more`)
  }

  if (pkg.buildDependencies?.length > 0) {
    console.log(`\nBuild dependencies: ${pkg.buildDependencies.length}`)
    pkg.buildDependencies.forEach((d: string) => console.log(`  - ${d}`))
  }

  // Find and parse package.yml FIRST (before dep download) so we can extract YAML build deps
  const pantryPath = join(process.cwd(), 'src', 'pantry', pkgName, 'package.yml')
  if (!existsSync(pantryPath)) {
    throw new Error(`Build recipe not found at ${pantryPath}`)
  }

  const yamlContent = readFileSync(pantryPath, 'utf-8')
  const recipe = parseYaml(yamlContent) as PackageRecipe
  console.log(`\nBuild recipe: ${pantryPath}`)

  // Extract build dependencies from YAML recipe and merge with TypeScript metadata deps
  const yamlBuildDeps = extractYamlDeps(recipe.build?.dependencies, platform)
  const yamlRuntimeDeps = extractYamlDeps(recipe.dependencies, platform)
  if (yamlBuildDeps.length > 0) {
    console.log(`\nYAML build dependencies: ${yamlBuildDeps.join(', ')}`)
  }

  // Download dependencies from S3 if bucket is provided
  let depPaths: Record<string, string> = {}
  if (bucket && region && depsDir) {
    // Merge TS metadata deps + YAML deps (deduplicate by domain)
    const tsDeps = [...(pkg.dependencies || []), ...(pkg.buildDependencies || [])]
    const allDepDomains = new Set<string>()
    const allDeps: string[] = []
    for (const dep of [...tsDeps, ...yamlBuildDeps, ...yamlRuntimeDeps]) {
      const domain = parseDep(dep)
      if (!allDepDomains.has(domain)) {
        allDepDomains.add(domain)
        allDeps.push(dep)
      }
    }
    depPaths = await downloadDependencies(allDeps, depsDir, platform, bucket, region)
    console.log(`\nDownloaded ${Object.keys(depPaths).filter(k => k.endsWith('.prefix')).length} dependencies`)
  }

  // Create directories
  mkdirSync(buildDir, { recursive: true })
  mkdirSync(prefix, { recursive: true })

  // Copy props directory if it exists (patches, proxy scripts, etc.)
  const propsDir = join(dirname(pantryPath), 'props')
  if (existsSync(propsDir)) {
    const destProps = join(buildDir, 'props')
    execSync(`cp -a "${propsDir}" "${destProps}"`, { stdio: 'pipe' })
    console.log(`📋 Copied props/ directory to build dir`)
  }

  // Determine version.tag from the versions.strip pattern in YAML
  // In pkgx, version.tag is the original git tag before strip was applied
  // Default strip for github: sources is /^v/ — but only if tag actually has v prefix
  const versionTag = determineVersionTag(yamlContent, version)

  // Setup template variables
  const cpuCount = (await import('node:os')).cpus().length
  const vMajor = version.split('.')[0]
  const vMinor = version.split('.')[1] || '0'
  const templateVars: Record<string, string> = {
    'version': version,
    'version.raw': version,
    'version.tag': versionTag,
    'version.major': vMajor,
    'version.minor': vMinor,
    'version.patch': version.split('.')[2] || '0',
    'version.marketing': `${vMajor}.${vMinor}`,
    'prefix': prefix,
    'hw.concurrency': String(cpuCount),
    'hw.arch': arch === 'arm64' ? 'aarch64' : 'x86-64',
    'hw.platform': osName,
    'hw.target': `${arch === 'arm64' ? 'aarch64' : 'x86-64'}-${osName}`,
    'srcroot': buildDir,
    'pkgx.prefix': prefix,
    'pkgx.dir': prefix,
    ...depPaths, // Add dependency paths for template interpolation
  }

  // Download source
  if (recipe.distributable?.url) {
    const rawUrl = typeof recipe.distributable.url === 'string' ? recipe.distributable.url : String(recipe.distributable.url)
    const sourceUrl = interpolate(rawUrl, templateVars)
    // Default strip-components: 1 for tar (standard), 0 for zip (many recipes expect outer dir)
    const isZipUrl = rawUrl.endsWith('.zip') || sourceUrl.endsWith('.zip')
    const stripComponents = recipe.distributable['strip-components'] ?? (isZipUrl ? 0 : 1)
    const ref = recipe.distributable.ref ? interpolate(recipe.distributable.ref, templateVars) : undefined

    try {
      await downloadSource(sourceUrl, buildDir, stripComponents, ref, pkgName, version)
    } catch (firstError: any) {
      let recovered = false

      // Retry 1: If URL used version.tag and download failed, try alternate tag format
      if (!recovered && rawUrl.includes('version.tag') && versionTag.startsWith('v')) {
        console.log(`⚠️  Download failed with tag ${versionTag}, retrying without v prefix...`)
        const altTag = version
        const altVars = { ...templateVars, 'version.tag': altTag }
        const altUrl = interpolate(rawUrl, altVars)
        const altRef = recipe.distributable.ref ? interpolate(recipe.distributable.ref, altVars) : undefined
        try {
          await downloadSource(altUrl, buildDir, stripComponents, altRef, pkgName, version)
          templateVars['version.tag'] = altTag
          recovered = true
        } catch { /* continue to next retry */ }
      }

      // Retry 2: If version ends in .0, strip trailing .0 components
      // First try stripping one .0, then strip ALL trailing .0s (e.g., 20251022.0.0 → 20251022)
      if (!recovered && version.endsWith('.0') && version.split('.').length >= 3) {
        const shortVersion = version.replace(/\.0$/, '')
        console.log(`⚠️  Download failed, retrying with shortened version ${shortVersion}...`)
        const altVars = {
          ...templateVars,
          'version': shortVersion,
          'version.raw': shortVersion,
          'version.marketing': shortVersion.split('.').slice(0, 2).join('.'),
          'version.patch': '0',
        }
        const altUrl = interpolate(rawUrl, altVars)
        const altRef = recipe.distributable.ref ? interpolate(recipe.distributable.ref, altVars) : undefined
        try {
          await downloadSource(altUrl, buildDir, stripComponents, altRef, pkgName, version)
          Object.assign(templateVars, altVars)
          recovered = true
        } catch { /* continue to next retry */ }
      }

      // Retry 3: Strip ALL trailing .0 components (e.g., 20251022.0.0 → 20251022)
      if (!recovered && version.includes('.0')) {
        const fullyStripped = version.replace(/(?:\.0)+$/, '')
        if (fullyStripped !== version && fullyStripped !== version.replace(/\.0$/, '')) {
          console.log(`⚠️  Download failed, retrying with fully stripped version ${fullyStripped}...`)
          const altVars = {
            ...templateVars,
            'version': fullyStripped,
            'version.raw': fullyStripped,
            'version.tag': versionTag.startsWith('v') ? `v${fullyStripped}` : fullyStripped,
            'version.marketing': fullyStripped.split('.').slice(0, 2).join('.'),
            'version.patch': '0',
          }
          const altUrl = interpolate(rawUrl, altVars)
          const altRef = recipe.distributable.ref ? interpolate(recipe.distributable.ref, altVars) : undefined
          try {
            await downloadSource(altUrl, buildDir, stripComponents, altRef, pkgName, version)
            Object.assign(templateVars, altVars)
            recovered = true
          } catch { /* continue to next retry */ }
        }
      }

      // Retry 4: If version.tag was used with v prefix and version also ends in .0
      if (!recovered && rawUrl.includes('version.tag') && versionTag.startsWith('v') && version.endsWith('.0')) {
        const shortVersion = version.replace(/\.0$/, '')
        console.log(`⚠️  Download failed, retrying with shortened version v${shortVersion}...`)
        const altVars = {
          ...templateVars,
          'version': shortVersion,
          'version.raw': shortVersion,
          'version.tag': `v${shortVersion}`,
          'version.marketing': shortVersion.split('.').slice(0, 2).join('.'),
          'version.patch': '0',
        }
        const altUrl = interpolate(rawUrl, altVars)
        const altRef = recipe.distributable.ref ? interpolate(recipe.distributable.ref, altVars) : undefined
        try {
          await downloadSource(altUrl, buildDir, stripComponents, altRef, pkgName, version)
          Object.assign(templateVars, altVars)
          recovered = true
        } catch { /* all retries exhausted */ }
      }

      // Retry 5: For alternation strip patterns, try each alternative as version.tag
      if (!recovered && rawUrl.includes('version.tag')) {
        const stripMatch = yamlContent.match(/strip:\s*\/(.+)\/$/) ?? yamlContent.match(/strip:\s*\/(.+)\//)
        if (stripMatch && stripMatch[1].includes('|')) {
          const pattern = stripMatch[1]
          const alts = pattern.replace(/^\(/, '').replace(/\)$/, '').split('|')
          for (const alt of alts) {
            if (recovered) break
            const altPrefix = alt.replace(/^\^/, '')
            const altTag = altPrefix + version
            if (altTag === versionTag) continue // Already tried
            console.log(`⚠️  Download failed, retrying with alternate version tag: ${altTag}...`)
            const altVars = { ...templateVars, 'version.tag': altTag }
            const altUrl = interpolate(rawUrl, altVars)
            const altRef = recipe.distributable.ref ? interpolate(recipe.distributable.ref, altVars) : undefined
            try {
              await downloadSource(altUrl, buildDir, stripComponents, altRef, pkgName, version)
              Object.assign(templateVars, altVars)
              recovered = true
            } catch { /* try next alternative */ }
          }
        }
      }

      if (!recovered) {
        throw firstError
      }
    }
  } else {
    throw new Error('No distributable URL found in package.yml')
  }

  // Build environment variables
  const buildEnv: Record<string, string> = {
    prefix,
    PREFIX: prefix,
  }

  // Process env section
  if (recipe.build?.env) {
    const env = recipe.build.env

    // Process ARGS
    let args: string[] = []
    if (env.ARGS) {
      args = Array.isArray(env.ARGS) ? env.ARGS : [env.ARGS]
    }

    // Add platform-specific ARGS
    if (env[osName]?.ARGS) {
      const platformArgs = Array.isArray(env[osName].ARGS) ? env[osName].ARGS : [env[osName].ARGS]
      args.push(...platformArgs)
    }

    // Apply build overrides from build-overrides.json (if any)
    const overrides = getBuildOverrides(pkgName)
    if (overrides?.extraConfigureArgs?.length) {
      console.log(`🔧 Applying build overrides for ${pkgName}: ${overrides.description || 'custom args'}`)
      args.push(...overrides.extraConfigureArgs)
    }

    // Interpolate ARGS
    buildEnv.ARGS = args.map(arg => interpolate(arg, templateVars)).join(' ')

    // Process other env vars
    for (const [key, value] of Object.entries(env)) {
      if (key === 'ARGS' || key === 'darwin' || key === 'linux' || key.includes('/')) continue

      if (typeof value === 'string') {
        buildEnv[key] = interpolate(value, templateVars)
      } else if (Array.isArray(value)) {
        buildEnv[key] = value.map(v => interpolate(v, templateVars)).join(' ')
      }
    }

    // Process platform-specific env vars
    const platformEnv = env[osName]
    if (platformEnv) {
      for (const [key, value] of Object.entries(platformEnv)) {
        if (key === 'ARGS') continue

        if (typeof value === 'string') {
          buildEnv[key] = interpolate(value, templateVars)
        } else if (Array.isArray(value)) {
          buildEnv[key] = value.map((v: string) => interpolate(v, templateVars)).join(' ')
        }
      }
    }
  }

  console.log('\n📋 Build environment:')
  for (const [key, value] of Object.entries(buildEnv)) {
    if (key === 'ARGS') {
      console.log(`   ${key}: ${value.slice(0, 80)}${value.length > 80 ? '...' : ''}`)
    } else {
      console.log(`   ${key}: ${value}`)
    }
  }

  // Generate and execute build script from YAML recipe (buildkit)
  console.log('\n🔨 Generating build script from YAML recipe...')

  const bashScript = generateBuildScript(
    recipe as PackageRecipe,
    pkgName,
    version,
    platform,
    prefix,
    buildDir,
    depPaths,
    templateVars['version.tag'],
  )

  const scriptPath = join(buildDir, '_build.sh')
  writeFileSync(scriptPath, bashScript, { mode: 0o755 })

  console.log(`📝 Build script written to ${scriptPath}`)
  console.log('\n🔨 Executing build script...')

  try {
    execSync(`bash "${scriptPath}"`, {
      cwd: buildDir,
      env: {
        ...process.env,
        // Only pass basic path vars — buildkit.ts handles all recipe env vars
        // (CFLAGS, LDFLAGS, ARGS, etc.) via export statements in the bash script.
        // Do NOT spread buildEnv here: it contains literal $VAR references from
        // interpolate() that pollute the bash script's variable expansion.
        prefix,
        PREFIX: prefix,
        SRCROOT: buildDir,
      },
      stdio: 'inherit',
      shell: '/bin/bash',
    })
  } catch (error: any) {
    console.error('❌ Build script failed')
    // Print the generated script for debugging
    console.error('\n--- Generated build script ---')
    console.error(bashScript.slice(0, 8000))
    if (bashScript.length > 8000) console.error(`... (truncated, ${bashScript.length} total chars)`)
    console.error('--- End script ---')
    throw error
  }

  // Post-build fix-ups for relocatable binaries
  console.log('\n🔧 Running post-build fix-ups...')
  const skips = getSkips(recipe as PackageRecipe)
  await fixUp(prefix, platform, skips)

  console.log(`\n✅ Build completed successfully!`)
  console.log(`📁 Installed to: ${prefix}`)

  // List what was installed
  try {
    const installed = execSync(`ls -la "${prefix}"`, { encoding: 'utf-8' })
    console.log('\n📦 Installed contents:')
    console.log(installed)
  } catch {
    // Ignore errors listing directory
  }
}

// CLI entry point
async function main() {
  const { values } = parseArgs({
    options: {
      package: { type: 'string', short: 'p' },
      version: { type: 'string', short: 'v' },
      platform: { type: 'string' },
      'build-dir': { type: 'string' },
      prefix: { type: 'string' },
      'deps-dir': { type: 'string' },
      bucket: { type: 'string', short: 'b' },
      region: { type: 'string', short: 'r', default: 'us-east-1' },
    },
    strict: true,
  })

  if (!values.package || !values.version || !values.platform || !values['build-dir'] || !values.prefix) {
    console.error('Usage: build-package.ts --package <domain> --version <version> --platform <platform> --build-dir <dir> --prefix <dir> [--deps-dir <dir>] [--bucket <name>] [--region <region>]')
    console.error('Example: build-package.ts --package php.net --version 8.4.11 --platform darwin-arm64 --build-dir /tmp/build --prefix /tmp/install')
    console.error('With S3: build-package.ts --package php.net --version 8.4.11 --platform darwin-arm64 --build-dir /tmp/build --prefix /tmp/install --deps-dir /tmp/deps --bucket my-bucket')
    process.exit(1)
  }

  await buildPackage({
    package: values.package,
    version: values.version,
    platform: values.platform,
    buildDir: values['build-dir'],
    prefix: values.prefix,
    depsDir: values['deps-dir'],
    bucket: values.bucket,
    region: values.region,
  })
}

main().catch((error) => {
  console.error('❌ Build failed:', error.message)
  // Exit code 42 = download failure (source 404/unavailable) — signals version fallback should try older versions
  // Exit code 1 = build/other failure — no point trying older versions
  if (error._downloadFailure) {
    process.exit(42)
  }
  process.exit(1)
})
