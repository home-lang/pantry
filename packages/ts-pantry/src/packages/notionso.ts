/**
 * **Notion** - An all-in-one workspace for notes, tasks, wikis, and databases.
 *
 * @domain `notion.so`
 * @programs `notion`
 * @version `4.5.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install notion.so`
 * @homepage https://notion.so
 */
export const notionsoPackage = {
  name: 'Notion' as const,
  domain: 'notion.so' as const,
  description: 'An all-in-one workspace for notes, tasks, wikis, and databases.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://notion.so' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install notion.so' as const,
  programs: ['notion'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['4.5.0', '4.4.0', '4.3.0'] as const,
  aliases: ['notion'] as const,
}
export type NotiosoPackage = typeof notionsoPackage
