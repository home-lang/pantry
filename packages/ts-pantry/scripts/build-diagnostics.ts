import { constants, closeSync, lstatSync, mkdirSync, mkdtempSync, openSync, readSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const MAX_LOG_BYTES = 4 * 1024 * 1024
const MAX_LOG_FILES = 16

/** Redact known credential values without recording the environment itself. */
export function sanitizeBuildDiagnostic(text: string, environment: NodeJS.ProcessEnv = process.env): string {
  const secrets = Object.entries(environment)
    .filter(([key, value]) => value && /secret|token|password|passwd|private.?key|api.?key|credential|authorization|access.?key|database.?url|connection.?string|dsn/i.test(key))
    .flatMap(([, value]) => [value!, encodeURIComponent(value!)])
    .sort((a, b) => b.length - a.length)
  for (const secret of new Set(secrets)) text = text.replaceAll(secret, '[REDACTED]')
  return text.replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/g, '$1[REDACTED]@')
}

/** Store bounded, sanitized configure logs from this build, never symlinks. */
export function persistBuildDiagnostics(options: { buildDir: string, script: string, error: unknown, runnerTemp?: string, environment?: NodeJS.ProcessEnv }): string | undefined {
  if (!options.runnerTemp) return undefined
  const base = join(options.runnerTemp, 'pantry-build-diagnostics')
  mkdirSync(base, { recursive: true, mode: 0o700 })
  if (!lstatSync(base).isDirectory() || lstatSync(base).isSymbolicLink()) throw new Error('Diagnostics directory must be a real directory')
  const output = mkdtempSync(join(base, 'build-'))
  const sanitize = (text: string) => {
    const clean = sanitizeBuildDiagnostic(text, options.environment)
    return clean.length > MAX_LOG_BYTES ? `${clean.slice(0, MAX_LOG_BYTES)}\n[diagnostic truncated at 4 MiB]\n` : clean
  }
  writeFileSync(join(output, 'build-script.sh.txt'), sanitize(options.script), { mode: 0o600 })
  writeFileSync(join(output, 'failure.txt'), sanitize(options.error instanceof Error ? options.error.stack || options.error.message : String(options.error)), { mode: 0o600 })
  let count = 0
  const visit = (directory: string, depth: number): void => {
    if (depth > 4 || count >= MAX_LOG_FILES) return
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (count >= MAX_LOG_FILES) break
      if (entry.isSymbolicLink() || entry.name === '.git' || entry.name === 'node_modules') continue
      const file = join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(file, depth + 1)
        continue
      }
      if (!entry.isFile() || entry.name !== 'config.log') continue
      const descriptor = openSync(file, constants.O_RDONLY | constants.O_NOFOLLOW)
      try {
        const bytes = new Uint8Array(MAX_LOG_BYTES * 2 + 1)
        const length = readSync(descriptor, bytes)
        const truncated = length > MAX_LOG_BYTES ? '\n[diagnostic truncated at 4 MiB]\n' : ''
        writeFileSync(join(output, `config-${++count}.log`), sanitize(new TextDecoder().decode(bytes.subarray(0, length))) + truncated, { mode: 0o600 })
      }
      finally { closeSync(descriptor) }
    }
  }
  if (!lstatSync(options.buildDir).isSymbolicLink()) visit(options.buildDir, 0)
  return output
}
