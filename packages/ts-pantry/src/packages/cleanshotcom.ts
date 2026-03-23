/**
 * **CleanShot X** - A screen capture and recording tool for macOS.
 *
 * @domain `cleanshot.com`
 * @programs `cleanshot`
 * @version `4.7.4` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install cleanshot.com`
 * @homepage https://cleanshot.com
 */
export const cleanshotcomPackage = {
  name: 'CleanShot X' as const,
  domain: 'cleanshot.com' as const,
  description: 'A screen capture and recording tool for macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://cleanshot.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install cleanshot.com' as const,
  programs: ['cleanshot'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['4.7.4', '4.7.3', '4.7.2'] as const,
  aliases: ['cleanshot'] as const,
}
export type CleanshotcomPackage = typeof cleanshotcomPackage
