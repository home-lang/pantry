/**
 * **Inkscape** - A professional vector graphics editor.
 *
 * @domain `inkscape.org`
 * @programs `inkscape`
 * @version `1.4.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install inkscape.org`
 * @homepage https://inkscape.org
 */
export const inkscapeorgPackage = {
  name: 'Inkscape' as const,
  domain: 'inkscape.org' as const,
  description: 'A professional vector graphics editor.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://inkscape.org' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install inkscape.org' as const,
  programs: ['inkscape'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.4.1', '1.4'] as const,
  aliases: ['inkscape'] as const,
}
export type InkscapeorgPackage = typeof inkscapeorgPackage
