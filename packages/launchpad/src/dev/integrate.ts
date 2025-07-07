import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

export default async function (op: 'install' | 'uninstall', { dryrun }: { dryrun: boolean }): Promise<void> {
  let opd_at_least_once = false
  const shellFiles = getShellFiles()

  for (const [file, line] of shellFiles) {
    try {
      let content = ''
      if (existsSync(file)) {
        content = readFileSync(file, 'utf8')
      }

      const hasHook = content.includes('# https://github.com/stacksjs/launchpad')
        || content.includes('# Added by launchpad')
        || content.includes('eval "$(launchpad dev:shellcode)"')
        || content.includes('LAUNCHPAD_SHELL_INTEGRATION=1')

      if (op === 'install') {
        if (hasHook) {
          console.error('hook already integrated:', file)
          continue
        }

        if (!dryrun) {
          // Ensure content ends with exactly one newline
          const cleanContent = content.replace(/\n+$/, '\n')
          writeFileSync(file, `${cleanContent}\n# Added by launchpad\n${line}  # https://github.com/stacksjs/launchpad\n`)
        }

        opd_at_least_once = true
        console.error(`${file} << \`${line}\``)
      }
      else if (op === 'uninstall') {
        if (!hasHook) {
          continue
        }

        const lines = content.split('\n')
        const filteredLines = lines.filter(line =>
          !line.includes('# https://github.com/stacksjs/launchpad')
          && !line.includes('# Added by launchpad')
          && !line.trim().startsWith('LAUNCHPAD_SHELL_INTEGRATION=1 eval')
          && line.trim() !== 'eval "$(launchpad dev:shellcode)"',
        )

        if (!dryrun) {
          writeFileSync(file, filteredLines.join('\n'))
        }

        opd_at_least_once = true
        console.error('removed hook:', file)
      }
    }
    catch (error) {
      console.error(`Failed to process ${file}:`, error instanceof Error ? error.message : error)
    }
  }

  if (dryrun && opd_at_least_once) {
    console.error(
      '%cthis was a dry-run. %cnothing was changed.',
      'color: #5f5fff',
      'color: initial',
    )
  }
  else {
    switch (op) {
      case 'uninstall':
        if (!opd_at_least_once) {
          console.error('nothing to deintegrate found')
        }
        break
      case 'install':
        if (opd_at_least_once) {
          // eslint-disable-next-line no-console
          console.log(
            'now %crestart your terminal%c for `launchpad` hooks to take effect',
            'color: #5f5fff',
            'color: initial',
          )
        }
    }
  }
}

function getShellFiles(): [string, string][] {
  // Use environment variable to suppress dotenvx and include comprehensive filtering
  const eval_ln = 'LAUNCHPAD_SHELL_INTEGRATION=1 eval "$(launchpad dev:shellcode 2>/dev/null | sed $\'s/\\x1b\\[[0-9;]*m//g\' | grep -v \'^\\[dotenvx@\' | grep -v \'^[[:space:]]*$\')"'

  const home = homedir()
  const zdotdir = process.env.ZDOTDIR || home
  const zshpair: [string, string] = [join(zdotdir, '.zshrc'), eval_ln]

  const candidates: [string, string][] = [
    zshpair,
    [join(home, '.bashrc'), eval_ln],
    [join(home, '.bash_profile'), eval_ln],
  ]

  const viable_candidates = candidates.filter(([file]) => existsSync(file))

  if (viable_candidates.length === 0) {
    if (platform() === 'darwin') {
      // macOS has no .zshrc by default and we want mac users to get a just works experience
      return [zshpair]
    }

    console.error('no `.shellrc` files found')
    process.exit(1)
  }

  return viable_candidates
}
