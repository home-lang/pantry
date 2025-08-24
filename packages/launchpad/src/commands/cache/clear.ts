import type { Command } from '../../cli/types'

const cmd: Command = {
  name: 'cache:clear',
  description: 'Clear all cached packages and downloads',
  async run({ argv }) {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const os = await import('node:os')
    const { config } = await import('../../config')

    const verbose = argv.includes('--verbose')
    const force = argv.includes('--force')
    const dryRun = argv.includes('--dry-run')

    if (verbose) config.verbose = true

    const homeDir = os.homedir()
    const cacheDir = path.join(homeDir, '.cache', 'launchpad')
    const bunCacheDir = path.join(homeDir, '.cache', 'launchpad', 'binaries', 'bun')
    const packageCacheDir = path.join(homeDir, '.cache', 'launchpad', 'binaries', 'packages')

    if (dryRun)
      console.log('🔍 DRY RUN MODE - Nothing will actually be cleared')

    console.log(`${dryRun ? 'Would clear' : 'Clearing'} Launchpad cache...`)

    if (!force && !dryRun) {
      console.log('⚠️  This will remove all cached packages and downloads')
      console.log('Use --force to skip confirmation or --dry-run to preview')
      return 0
    }

    let totalSize = 0
    let fileCount = 0

    const calculateCacheStats = (dir: string) => {
      if (!fs.existsSync(dir)) return
      try {
        const stack = [dir]
        while (stack.length > 0) {
          const currentDir = stack.pop()!
          try {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true })
            for (const entry of entries) {
              const fullPath = path.join(currentDir, entry.name)
              if (entry.isFile()) {
                try {
                  const stats = fs.statSync(fullPath)
                  totalSize += stats.size
                  fileCount++
                }
                catch { /* ignore */ }
              }
              else if (entry.isDirectory()) {
                stack.push(fullPath)
              }
            }
          }
          catch { /* ignore unreadable dirs */ }
        }
      }
      catch { /* ignore */ }
    }

    if (fs.existsSync(cacheDir)) calculateCacheStats(cacheDir)

    const formatSize = (bytes: number): string => {
      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`
    }

    if (dryRun) {
      if (fs.existsSync(cacheDir)) {
        console.log(`📊 Cache statistics:`)
        console.log(`   • Total size: ${formatSize(totalSize)}`)
        console.log(`   • File count: ${fileCount}`)
        console.log(`   • Cache directory: ${cacheDir}`)
        console.log('')
        console.log('Would remove:')
        if (fs.existsSync(bunCacheDir)) console.log(`   • Bun cache: ${bunCacheDir}`)
        if (fs.existsSync(packageCacheDir)) console.log(`   • Package cache: ${packageCacheDir}`)
      }
      else {
        console.log('📭 No cache found - nothing to clear')
      }
      return 0
    }

    if (fs.existsSync(cacheDir)) {
      console.log(`📊 Clearing ${formatSize(totalSize)} of cached data (${fileCount} files)...`)
      fs.rmSync(cacheDir, { recursive: true, force: true })
      console.log('✅ Cache cleared successfully!')
      console.log(`   • Freed ${formatSize(totalSize)} of disk space`)
      console.log(`   • Removed ${fileCount} cached files`)
    }
    else {
      console.log('📭 No cache found - nothing to clear')
    }

    return 0
  },
}

export default cmd
