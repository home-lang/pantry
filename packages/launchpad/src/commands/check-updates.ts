import type { Command } from '../cli/types'

const cmd: Command = {
  name: 'check-updates',
  aliases: [],
  description: 'Check global dependencies for updates (TTL-based); auto-update if enabled',
  async run({ argv, env }) {
    const { checkAndMaybeUpdate } = await import('../dev/update-check')

    // Flags (optional): --dry-run to skip network, --auto-update to force on
    const dryRun = argv.includes('--dry-run') || env.LAUNCHPAD_SKIP_NETWORK === '1'
    const autoUpdate = argv.includes('--auto-update') || env.LAUNCHPAD_AUTO_UPDATE_GLOBALS === '1'

    const result = await checkAndMaybeUpdate({ dryRun, autoUpdate })

    if (env.CI === 'true' || env.GITHUB_ACTIONS === 'true') {
      // Minimal CI output for diagnostics, same shape as existing implementation
      console.log(JSON.stringify(result))
    }

    // Return 0 always; this is an informational/background command
    return 0
  },
}

export default cmd
