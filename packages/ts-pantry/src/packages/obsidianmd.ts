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
  versions: [
    '1.12.7',
    '1.12.4',
    '1.11.7',
    '1.11.5',
    '1.11.4',
    '1.10.6',
    '1.10.3',
    '1.9.14',
    '1.9.12',
    '1.9.10',
    '1.8.10',
    '1.8.9',
    '1.8.7',
    '1.8.4',
    '1.8.3',
    '1.7.7',
    '1.7.6',
    '1.7.5',
    '1.7.4',
    '1.6.7',
  ] as const,
  aliases: ['obsidian'] as const,
}
export type ObsidianmdPackage = typeof obsidianmdPackage
