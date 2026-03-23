/**
 * **Logi Options+** - Logitech device customization and settings application.
 *
 * @domain `logitech.com/options`
 * @programs `logi-options`
 * @version `1.80` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install logitech.com/options`
 * @homepage https://www.logitech.com/software/logi-options-plus.html
 */
export const logitechcomoptionsPackage = {
  name: 'Logi Options+' as const,
  domain: 'logitech.com/options' as const,
  description: 'Logitech device customization and settings application.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://www.logitech.com/software/logi-options-plus.html' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install logitech.com/options' as const,
  programs: ['logi-options'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.80', '1.79'] as const,
  aliases: ['logi-options-plus', 'logi-options'] as const,
}
export type LogitechcomoptionsPackage = typeof logitechcomoptionsPackage
