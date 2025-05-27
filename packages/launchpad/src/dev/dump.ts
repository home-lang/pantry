import { exec } from 'node:child_process'
import process from 'node:process'
import { promisify } from 'node:util'
import shell_escape from './shell-escape.ts'
import sniff from './sniff.ts'

const execAsync = promisify(exec)

export default async function (
  cwd: string,
  opts: { dryrun: boolean, quiet: boolean },
): Promise<void> {
  const snuff = await sniff({ string: cwd })

  if (snuff.pkgs.length === 0 && Object.keys(snuff.env).length === 0) {
    console.error('no devenv detected')
    process.exit(1)
  }

  let env = ''
  const pkgspecs = snuff.pkgs.map(pkg => `+${pkg.project}@${convertVersionConstraint(pkg.constraint.toString())}`)

  // Convert version constraints that pkgx doesn't understand
  function convertVersionConstraint(constraint: string): string {
    // Remove caret and tilde prefixes that pkgx doesn't support
    if (constraint.startsWith('^') || constraint.startsWith('~')) {
      return constraint.slice(1)
    }
    // Convert >= constraints to just the version
    if (constraint.startsWith('>=')) {
      return constraint.slice(2)
    }
    return constraint
  }

  if (opts.dryrun) {
    // eslint-disable-next-line no-console
    console.log(pkgspecs.join(' '))
    return
  }

  if (snuff.pkgs.length > 0) {
    try {
      // Try to use pkgx to get environment variables
      const { stdout } = await execAsync(`pkgx --quiet ${pkgspecs.join(' ')} env`, {
        env: { ...process.env, CLICOLOR_FORCE: '1' },
        encoding: 'utf8',
      })

      // Parse the environment output and properly escape values
      const envLines = stdout.trim().split('\n')
      for (const line of envLines) {
        if (!line || line.startsWith('#'))
          continue

        const equalIndex = line.indexOf('=')
        if (equalIndex === -1)
          continue

        const key = line.slice(0, equalIndex)
        const value = line.slice(equalIndex + 1)

        // Skip problematic environment variables that might cause parsing issues
        if (key === 'LS_COLORS' || key === '_' || key.includes('VSCODE') || key.includes('CURSOR')) {
          continue
        }

        // Properly escape the value for shell
        env += `${key}=${shell_escape(value)}\n`
      }
    }
    catch {
      // If pkgx is not available, just create basic environment setup
      for (const pkg of snuff.pkgs) {
        env += `# Package: ${pkg.project}@${pkg.constraint}\n`
      }
    }
  }

  // add any additional env that we sniffed
  for (const [key, value] of Object.entries(snuff.env)) {
    env += `${key}=${shell_escape(value)}\n`
  }

  env = env.trim()

  let undo = ''
  for (const envln of env.trim().split('\n')) {
    if (!envln)
      continue

    const [key] = envln.split('=', 2)
    undo += `    if [ \\"$${key}\\" ]; then
      export ${key}=\\"$${key}\\"
    else
      unset ${key}
    fi\n`
  }

  const bye_bye_msg = pkgspecs.map(pkgspec => `-${pkgspec.slice(1)}`).join(
    ' ',
  )

  if (!opts.quiet) {
    console.error('%c%s', 'color: green', pkgspecs.join(' '))
  }

  // eslint-disable-next-line no-console
  console.log(`
  eval "_pkgx_dev_try_bye() {
    suffix=\\"\\\${PWD#\\"${cwd}\\"}\\"
    [ \\"\\$PWD\\" = \\"${cwd}\\$suffix\\" ] && return 1
    echo -e \\"\\033[31m${bye_bye_msg}\\033[0m\\" >&2
    ${undo.trim()}
    unset -f _pkgx_dev_try_bye
  }"

  set -a
  ${env}
  set +a`)
}
