/**
 * **Insomnia** - A collaborative API client and design tool.
 *
 * @domain `insomnia.rest`
 * @programs `insomnia`
 * @version `10.3.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install insomnia.rest`
 * @homepage https://insomnia.rest
 */
export const insomniarestPackage = {
  name: 'Insomnia' as const,
  domain: 'insomnia.rest' as const,
  description: 'A collaborative API client and design tool.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://insomnia.rest' as const,
  githubUrl: 'https://github.com/Kong/insomnia' as const,
  installCommand: 'pantry install insomnia.rest' as const,
  programs: ['insomnia'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['10.3.0', '10.2.0'] as const,
  aliases: ['insomnia'] as const,
}
export type InsomniarestPackage = typeof insomniarestPackage
