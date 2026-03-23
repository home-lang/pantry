/**
 * **Discord** - A voice, video, and text chat platform.
 *
 * @domain `discord.com`
 * @programs `discord`
 * @version `0.0.337` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install discord.com`
 * @homepage https://discord.com
 */
export const discordcomPackage = {
  name: 'Discord' as const,
  domain: 'discord.com' as const,
  description: 'A voice, video, and text chat platform.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://discord.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install discord.com' as const,
  programs: ['discord'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['0.0.337', '0.0.336', '0.0.335'] as const,
  aliases: ['discord'] as const,
}
export type DiscordcomPackage = typeof discordcomPackage
