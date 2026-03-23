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
  versions: [
    '2.12.5',
    '2.12.4',
    '2.12.3',
    '2.12.2',
    '2.12.1',
    '2.12.0',
    '2.11.67',
    '2.11.66',
    '2.11.65',
    '2.11.64',
    '2.11.63',
    '2.11.62',
    '2.11.61',
    '2.11.60',
    '2.11.59',
    '2.11.58',
    '2.11.57',
    '2.11.56',
    '2.11.55',
    '2.11.54',
  ] as const,
  aliases: ['stats'] as const,
}
export type StatsappPackage = typeof statsappPackage
