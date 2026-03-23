/**
 * **KeePassXC** - A cross-platform community-driven password manager.
 *
 * @domain `keepassxc.org`
 * @programs `keepassxc`
 * @version `2.7.9` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install keepassxc.org`
 * @homepage https://keepassxc.org
 */
export const keepassxcorgPackage = {
  name: 'KeePassXC' as const,
  domain: 'keepassxc.org' as const,
  description: 'A cross-platform community-driven password manager.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://keepassxc.org' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install keepassxc.org' as const,
  programs: ['keepassxc'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['2.7.9', '2.7.8'] as const,
  aliases: ['keepassxc'] as const,
}
export type KeepassxcorgPackage = typeof keepassxcorgPackage
