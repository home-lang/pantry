/**
 * **Brave Browser** - A privacy-focused web browser that blocks ads and trackers.
 *
 * @domain `brave.com`
 * @programs `brave`
 * @version `1.74.48` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install brave.com`
 * @homepage https://brave.com
 */
export const bravecomPackage = {
  name: 'Brave Browser' as const,
  domain: 'brave.com' as const,
  description: 'A privacy-focused web browser that blocks ads and trackers.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://brave.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install brave.com' as const,
  programs: ['brave'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.74.48', '1.74.47', '1.74.46'] as const,
  aliases: ['brave'] as const,
}
export type BravecomPackage = typeof bravecomPackage
