/**
 * **Blender** - A free and open-source 3D creation suite.
 *
 * @domain `blender.org`
 * @programs `blender`
 * @version `4.3.2` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install blender.org`
 * @homepage https://blender.org
 */
export const blenderorgPackage = {
  name: 'Blender' as const,
  domain: 'blender.org' as const,
  description: 'A free and open-source 3D creation suite.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://blender.org' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install blender.org' as const,
  programs: ['blender'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['4.3.2', '4.3.1'] as const,
  aliases: ['blender'] as const,
}
export type BlenderorgPackage = typeof blenderorgPackage
