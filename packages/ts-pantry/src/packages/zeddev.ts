/**
 * **Zed** - A high-performance, multiplayer code editor.
 *
 * @domain `zed.dev`
 * @programs `zed`
 * @version `0.170.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install zed.dev`
 * @homepage https://zed.dev
 */
export const zeddevPackage = {
  name: 'Zed' as const,
  domain: 'zed.dev' as const,
  description: 'A high-performance, multiplayer code editor.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://zed.dev' as const,
  githubUrl: 'https://github.com/zed-industries/zed' as const,
  installCommand: 'pantry install zed.dev' as const,
  programs: ['zed'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['0.170.0', '0.169.0', '0.168.0'] as const,
  aliases: ['zed'] as const,
}
export type ZeddevPackage = typeof zeddevPackage
