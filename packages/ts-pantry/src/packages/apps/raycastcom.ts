/**
 * **Raycast** - A blazingly fast launcher and productivity tool for macOS.
 *
 * @domain `raycast.com`
 * @programs `raycast`
 * @version `1.104.32` (15 versions available)
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
  versions: [
    '1.104.32',
    '1.104.31',
    '1.104.30',
    '1.104.29',
    '1.104.28',
    '1.104.26',
    '1.104.25',
    '1.104.24',
    '1.104.23',
    '1.104.22',
    '1.104.21',
    '1.104.20',
    '1.89.0',
    '1.88.0',
    '1.87.0',
  ] as const,
  aliases: ['raycast'] as const,
}
export type RaycastcomPackage = typeof raycastcomPackage
