import type { Command } from '../../cli/types'

const cmd: Command = {
  name: 'cache:stats',
  description: 'Show cache statistics and usage information',
  async run() {
    const { getCacheStats } = await import('../../cache')

    console.log('📊 Cache Statistics\n')

    const stats = getCacheStats()

    console.log(`📦 Cached Packages: ${stats.packages}`)
    console.log(`💾 Total Size: ${stats.size}`)
    console.log(`📅 Oldest Access: ${stats.oldestAccess}`)
    console.log(`📅 Newest Access: ${stats.newestAccess}`)

    if (stats.packages > 0) {
      console.log('\n💡 Use `launchpad cache:clean` to free up disk space')
    }

    return 0
  },
}

export default cmd
