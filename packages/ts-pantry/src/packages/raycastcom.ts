/**
 * **Raycast** - A blazingly fast launcher and productivity tool for macOS.
 *
 * @domain `raycast.com`
 * @programs `raycast`
 * @version `1.89.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install raycast.com`
 * @homepage https://raycast.com
 */
export const raycastcomPackage = {
  name: 'Raycast' as const,
  domain: 'raycast.com' as const,
  description: 'A blazingly fast launcher and productivity tool for macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://raycast.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install raycast.com' as const,
  programs: ['raycast'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.89.0', '1.88.0', '1.87.0'] as const,
  aliases: ['raycast'] as const,
}
export type RaycastcomPackage = typeof raycastcomPackage
