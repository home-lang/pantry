/**
 * **GIMP** - A free and open-source raster graphics editor.
 *
 * @domain `gimp.org`
 * @programs `gimp`
 * @version `2.10.38` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install gimp.org`
 * @homepage https://gimp.org
 */
export const gimporgPackage = {
  name: 'GIMP' as const,
  domain: 'gimp.org' as const,
  description: 'A free and open-source raster graphics editor.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://gimp.org' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install gimp.org' as const,
  programs: ['gimp'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['2.10.38', '2.10.36'] as const,
  aliases: ['gimp'] as const,
}
export type GimporgPackage = typeof gimporgPackage
