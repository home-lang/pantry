/**
 * **Linear** - A streamlined issue tracking and project management tool.
 *
 * @domain `linear.app`
 * @programs `linear`
 * @version `1.53.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install linear.app`
 * @homepage https://linear.app
 */
export const linearappPackage = {
  name: 'Linear' as const,
  domain: 'linear.app' as const,
  description: 'A streamlined issue tracking and project management tool.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://linear.app' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install linear.app' as const,
  programs: ['linear'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.53.0', '1.52.0', '1.51.0'] as const,
  aliases: ['linear'] as const,
}
export type LinearappPackage = typeof linearappPackage
