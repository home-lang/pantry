/**
 * **Bruno** - A fast and Git-friendly open-source API client.
 *
 * @domain `bruno.app`
 * @programs `bruno`
 * @version `1.38.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install bruno.app`
 * @homepage https://usebruno.com
 */
export const brunoappPackage = {
  name: 'Bruno' as const,
  domain: 'bruno.app' as const,
  description: 'A fast and Git-friendly open-source API client.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://usebruno.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install bruno.app' as const,
  programs: ['bruno'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.38.1', '1.38.0'] as const,
  aliases: ['bruno'] as const,
}
export type BrunoappPackage = typeof brunoappPackage
