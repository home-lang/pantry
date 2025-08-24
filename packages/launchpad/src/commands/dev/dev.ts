import type { Command } from '../../cli/types'

const cmd: Command = {
  name: 'dev',
  description: 'Set up development environment for project dependencies',
  async run({ argv, env }) {
    const path = await import('node:path')

    // Flags
    const dryRun = argv.includes('--dry-run')
    const quiet = argv.includes('--quiet')
    const shell = argv.includes('--shell')

    const nonFlagArgs = argv.filter(a => !a.startsWith('--'))
    const dirArg = nonFlagArgs[0]
    const targetDir = dirArg ? path.resolve(dirArg) : process.cwd()

    // For shell integration, force quiet mode and set environment variable
    const isShellIntegration = shell || false
    if (isShellIntegration)
      env.LAUNCHPAD_SHELL_INTEGRATION = '1'

    const { dump } = await import('../../dev/dump')
    await dump(targetDir, {
      dryrun: dryRun,
      quiet: quiet || isShellIntegration,
      shellOutput: isShellIntegration,
      skipGlobal: env.NODE_ENV === 'test' || env.LAUNCHPAD_SKIP_GLOBAL_AUTO_SCAN === 'true',
    })

    return 0
  },
}

export default cmd
