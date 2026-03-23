/**
 * **IINA** - A modern media player for macOS.
 *
 * @domain `iina.io`
 * @programs `iina`
 * @version `1.3.5` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install iina.io`
 * @homepage https://iina.io
 */
export const iinaioPackage = {
  name: 'IINA' as const,
  domain: 'iina.io' as const,
  description: 'A modern media player for macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://iina.io' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install iina.io' as const,
  programs: ['iina'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.3.5', '1.3.4'] as const,
  aliases: ['iina'] as const,
}
export type IinaioPackage = typeof iinaioPackage
