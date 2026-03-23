/**
 * **Telegram** - A cloud-based messaging app with a focus on speed and security.
 *
 * @domain `telegram.org`
 * @programs `telegram`
 * @version `5.8.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install telegram.org`
 * @homepage https://telegram.org
 */
export const telegramorgPackage = {
  name: 'Telegram' as const,
  domain: 'telegram.org' as const,
  description: 'A cloud-based messaging app with a focus on speed and security.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://telegram.org' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install telegram.org' as const,
  programs: ['telegram'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['5.8.0', '5.7.0'] as const,
  aliases: ['telegram'] as const,
}
export type TelegramorgPackage = typeof telegramorgPackage
