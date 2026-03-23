/**
 * **Stats** - A macOS system monitor in your menu bar.
 *
 * @domain `stats.app`
 * @programs `stats`
 * @version `2.11.23` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install stats.app`
 * @homepage https://github.com/exelban/stats
 */
export const statsappPackage = {
  name: 'Stats' as const,
  domain: 'stats.app' as const,
  description: 'A macOS system monitor in your menu bar.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://github.com/exelban/stats' as const,
  githubUrl: 'https://github.com/exelban/stats' as const,
  installCommand: 'pantry install stats.app' as const,
  programs: ['stats'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['2.11.23', '2.11.22', '2.11.21'] as const,
  aliases: ['stats'] as const,
}
export type StatsappPackage = typeof statsappPackage
