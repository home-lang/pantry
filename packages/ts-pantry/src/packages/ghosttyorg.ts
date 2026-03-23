/**
 * **Ghostty** - A fast, feature-rich, and cross-platform terminal emulator.
 *
 * @domain `ghostty.org`
 * @programs `ghostty`
 * @version `1.1.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install ghostty.org`
 * @homepage https://ghostty.org
 */
export const ghosttyorgPackage = {
  name: 'Ghostty' as const,
  domain: 'ghostty.org' as const,
  description: 'A fast, feature-rich, and cross-platform terminal emulator.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://ghostty.org' as const,
  githubUrl: 'https://github.com/ghostty-org/ghostty' as const,
  installCommand: 'pantry install ghostty.org' as const,
  programs: ['ghostty'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.1.0', '1.0.1', '1.0.0'] as const,
  aliases: ['ghostty'] as const,
}
export type GhosttyorgPackage = typeof ghosttyorgPackage
