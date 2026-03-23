/**
 * **Arc** - A Chromium-based web browser with a focus on design and productivity.
 *
 * @domain `arc.net`
 * @programs `arc`
 * @version `1.76.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install arc.net`
 * @homepage https://arc.net
 */
export const arcnetPackage = {
  name: 'Arc' as const,
  domain: 'arc.net' as const,
  description: 'A Chromium-based web browser with a focus on design and productivity.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://arc.net' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install arc.net' as const,
  programs: ['arc'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.76.0', '1.75.0', '1.74.0'] as const,
  aliases: ['arc'] as const,
}
export type ArcnetPackage = typeof arcnetPackage
