/**
 * **Maccy** - A lightweight clipboard manager for macOS.
 *
 * @domain `maccy.app`
 * @programs `maccy`
 * @version `2.4.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install maccy.app`
 * @homepage https://maccy.app
 */
export const maccyappPackage = {
  name: 'Maccy' as const,
  domain: 'maccy.app' as const,
  description: 'A lightweight clipboard manager for macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://maccy.app' as const,
  githubUrl: 'https://github.com/p0deje/Maccy' as const,
  installCommand: 'pantry install maccy.app' as const,
  programs: ['maccy'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['2.4.0', '2.3.0', '2.2.0'] as const,
  aliases: ['maccy'] as const,
}
export type MaccyappPackage = typeof maccyappPackage
