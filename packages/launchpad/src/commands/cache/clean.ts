import type { Command } from '../../cli/types'

const cmd: Command = {
  name: 'cache:clean',
  description: 'Clean up old cached packages based on age and size limits',
  async run({ argv }) {
    const { getCacheStats, cleanupCache } = await import('../../cache')

    const getArgValue = (flag: string): string | undefined => {
      const idx = argv.indexOf(flag)
      if (idx !== -1 && idx + 1 < argv.length) return argv[idx + 1]
      return undefined
    }

    const maxAge = getArgValue('--max-age')
    const maxSize = getArgValue('--max-size')
    const dryRun = argv.includes('--dry-run')

    const maxAgeDays = maxAge ? Number.parseInt(maxAge, 10) : 30
    const maxSizeGB = maxSize ? Number.parseFloat(maxSize) : 5

    if (dryRun) {
      console.log('🔍 DRY RUN - Showing what would be cleaned:\n')
      const stats = getCacheStats()
      console.log(`Current cache: ${stats.packages} packages, ${stats.size}`)
      console.log(`Cleanup criteria: older than ${maxAgeDays} days OR total size > ${maxSizeGB} GB`)
      console.log('\n💡 Run without --dry-run to actually clean the cache')
      return 0
    }

    console.log('🧹 Cleaning cache...\n')
    cleanupCache(maxAgeDays, maxSizeGB)

    const newStats = getCacheStats()
    console.log(`\n✅ Cache cleanup completed`)
    console.log(`📦 Remaining packages: ${newStats.packages}`)
    console.log(`💾 Current size: ${newStats.size}`)

    return 0
  },
}

export default cmd
