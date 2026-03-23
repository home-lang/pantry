/**
 * **Obsidian** - A powerful knowledge base that works on local Markdown files.
 *
 * @domain `obsidian.md`
 * @programs `obsidian`
 * @version `1.7.7` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install obsidian.md`
 * @homepage https://obsidian.md
 */
export const obsidianmdPackage = {
  name: 'Obsidian' as const,
  domain: 'obsidian.md' as const,
  description: 'A powerful knowledge base that works on local Markdown files.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://obsidian.md' as const,
  githubUrl: 'https://github.com/obsidianmd/obsidian-releases' as const,
  installCommand: 'pantry install obsidian.md' as const,
  programs: ['obsidian'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.7.7', '1.7.6', '1.7.5'] as const,
  aliases: ['obsidian'] as const,
}
export type ObsidianmdPackage = typeof obsidianmdPackage
