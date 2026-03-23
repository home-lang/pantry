/**
 * **TablePlus** - A modern, native database management tool.
 *
 * @domain `tableplus.com`
 * @programs `tableplus`
 * @version `6.2.6` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install tableplus.com`
 * @homepage https://tableplus.com
 */
export const tablepluscomPackage = {
  name: 'TablePlus' as const,
  domain: 'tableplus.com' as const,
  description: 'A modern, native database management tool.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://tableplus.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install tableplus.com' as const,
  programs: ['tableplus'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['6.2.6', '6.2.5', '6.2.4'] as const,
  aliases: ['tableplus'] as const,
}
export type TablepluscomPackage = typeof tablepluscomPackage
