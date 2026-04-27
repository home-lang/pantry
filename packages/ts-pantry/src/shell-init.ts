/**
 * Shell PATH integration for pantry-installed packages.
 *
 * Without this, `pantry install --global zig` drops `zig` into a stable dir
 * but the user's shell never finds it. The functions here either print the
 * one-liner the user can `eval` from their rc file, or write it directly
 * into a detected shell rc file.
 *
 * The Zig CLI ships a much richer shell hook (project-aware activation,
 * caching, etc.). This module is the minimal subset needed so the TS
 * installer alone is enough to make installed binaries discoverable.
 */

import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { globalBinDir } from './installer'

export type SupportedShell = 'zsh' | 'bash' | 'fish' | 'unknown'

const MARKER_BEGIN = '# >>> pantry shell-init >>>'
const MARKER_END = '# <<< pantry shell-init <<<'

export interface ShellInitOptions {
  /** Override the global bin dir (defaults to `globalBinDir()`). */
  globalBin?: string
  /** Override the detected shell (defaults to autodetect). */
  shell?: SupportedShell
}

/**
 * Detect the user's interactive shell via `$SHELL`. Falls back to `unknown`
 * for non-POSIX environments where we can't safely guess.
 */
export function detectShell(): SupportedShell {
  const shell = process.env.SHELL ?? ''
  if (shell.endsWith('/zsh') || shell === 'zsh') return 'zsh'
  if (shell.endsWith('/bash') || shell === 'bash') return 'bash'
  if (shell.endsWith('/fish') || shell === 'fish') return 'fish'
  return 'unknown'
}

/**
 * Pick the rc file we should append to for a given shell. Returns `null` for
 * shells we don't know how to integrate with non-interactively.
 */
export function rcFileFor(shell: SupportedShell): string | null {
  const home = os.homedir()
  switch (shell) {
    case 'zsh': {
      const zdotdir = process.env.ZDOTDIR
      return path.join(zdotdir && zdotdir.length > 0 ? zdotdir : home, '.zshrc')
    }
    case 'bash': {
      // Prefer `.bashrc` on Linux; macOS bash users usually want `.bash_profile`.
      if (os.platform() === 'darwin') {
        const profile = path.join(home, '.bash_profile')
        if (fs.existsSync(profile)) return profile
      }
      return path.join(home, '.bashrc')
    }
    case 'fish':
      return path.join(home, '.config', 'fish', 'config.fish')
    case 'unknown':
      return null
  }
}

/**
 * Render the shell snippet that puts pantry's global bin on PATH. POSIX form
 * for zsh/bash; fish gets a `set -gx PATH` form.
 */
export function renderShellSnippet(opts: ShellInitOptions = {}): string {
  const dir = opts.globalBin ?? globalBinDir()
  const shell = opts.shell ?? detectShell()

  if (shell === 'fish') {
    return [
      MARKER_BEGIN,
      `if test -d "${dir}"`,
      `    set -gx PATH "${dir}" $PATH`,
      `end`,
      MARKER_END,
      '',
    ].join('\n')
  }

  // POSIX (zsh/bash/sh) — guard against double-prepending.
  return [
    MARKER_BEGIN,
    `if [ -d "${dir}" ] && [[ ":$PATH:" != *":${dir}:"* ]]; then`,
    `    export PATH="${dir}:$PATH"`,
    `fi`,
    MARKER_END,
    '',
  ].join('\n')
}

export interface InstallShellInitResult {
  rcFile: string
  shell: SupportedShell
  changed: boolean
}

/**
 * Idempotently append the snippet to the user's shell rc file. Re-runs are
 * a no-op (we look for our begin marker). Returns `changed: false` if the
 * snippet was already present.
 */
export function installShellInit(opts: ShellInitOptions = {}): InstallShellInitResult {
  const shell = opts.shell ?? detectShell()
  const rcFile = rcFileFor(shell)
  if (!rcFile) {
    throw new Error(
      `Could not detect a supported shell (got SHELL=${process.env.SHELL ?? '<unset>'}). `
      + `Run \`ts-pantry shell-init\` and copy the printed snippet into your rc file manually.`,
    )
  }

  const snippet = renderShellSnippet({ ...opts, shell })

  let existing = ''
  if (fs.existsSync(rcFile)) {
    existing = fs.readFileSync(rcFile, 'utf-8')
    if (existing.includes(MARKER_BEGIN)) {
      return { rcFile, shell, changed: false }
    }
  }
  else {
    // Make sure the directory exists for things like ~/.config/fish/.
    fs.mkdirSync(path.dirname(rcFile), { recursive: true })
  }

  const sep = existing.length > 0 && !existing.endsWith('\n') ? '\n\n' : '\n'
  fs.appendFileSync(rcFile, sep + snippet)
  return { rcFile, shell, changed: true }
}

/**
 * Remove a previously installed snippet (between our markers). Safe to call
 * even if no snippet was installed.
 */
export function uninstallShellInit(opts: ShellInitOptions = {}): InstallShellInitResult {
  const shell = opts.shell ?? detectShell()
  const rcFile = rcFileFor(shell)
  if (!rcFile || !fs.existsSync(rcFile)) {
    return { rcFile: rcFile ?? '<none>', shell, changed: false }
  }

  const original = fs.readFileSync(rcFile, 'utf-8')
  const startIdx = original.indexOf(MARKER_BEGIN)
  if (startIdx === -1) return { rcFile, shell, changed: false }
  const endIdx = original.indexOf(MARKER_END, startIdx)
  if (endIdx === -1) return { rcFile, shell, changed: false }

  // Strip the block plus the trailing newline so we don't leave a blank gap.
  const after = original.slice(endIdx + MARKER_END.length).replace(/^\n/, '')
  const before = original.slice(0, startIdx).replace(/\n+$/, '\n')
  fs.writeFileSync(rcFile, before + after)
  return { rcFile, shell, changed: true }
}
