/**
 * **OrbStack** - A fast, lightweight Docker and Linux on macOS.
 *
 * @domain `orbstack.dev`
 * @programs `orbstack`
 * @version `1.9.2` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install orbstack.dev`
 * @homepage https://orbstack.dev
 */
export const orbstackdevPackage = {
  name: 'OrbStack' as const,
  domain: 'orbstack.dev' as const,
  description: 'A fast, lightweight Docker and Linux on macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://orbstack.dev' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install orbstack.dev' as const,
  programs: ['orbstack'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.9.2', '1.9.1', '1.9.0'] as const,
  aliases: ['orbstack'] as const,
}
export type OrbstackdevPackage = typeof orbstackdevPackage
