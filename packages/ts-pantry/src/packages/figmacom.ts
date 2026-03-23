/**
 * **Figma** - A collaborative interface design tool.
 *
 * @domain `figma.com`
 * @programs `figma`
 * @version `124.7.4` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install figma.com`
 * @homepage https://figma.com
 */
export const figmacomPackage = {
  name: 'Figma' as const,
  domain: 'figma.com' as const,
  description: 'A collaborative interface design tool.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://figma.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install figma.com' as const,
  programs: ['figma'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['124.7.4', '124.7.3', '124.7.2'] as const,
  aliases: ['figma'] as const,
}
export type FigmacomPackage = typeof figmacomPackage
