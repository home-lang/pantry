/**
 * **Hidden Bar** - A utility to hide menu bar items on macOS.
 *
 * @domain `hiddenbar.app`
 * @programs `hiddenbar`
 * @version `1.9` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install hiddenbar.app`
 * @homepage https://github.com/dwarvesf/hidden
 */
export const hiddenbarappPackage = {
  name: 'Hidden Bar' as const,
  domain: 'hiddenbar.app' as const,
  description: 'A utility to hide menu bar items on macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://github.com/dwarvesf/hidden' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install hiddenbar.app' as const,
  programs: ['hiddenbar'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.9', '1.8'] as const,
  aliases: ['hiddenbar', 'hidden-bar'] as const,
}
export type HiddenbarappPackage = typeof hiddenbarappPackage
