/**
 * **DBeaver** - A universal database tool for developers and database administrators.
 *
 * @domain `dbeaver.io`
 * @programs `dbeaver`
 * @version `24.3.4` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install dbeaver.io`
 * @homepage https://dbeaver.io
 */
export const dbeaverioPackage = {
  name: 'DBeaver' as const,
  domain: 'dbeaver.io' as const,
  description: 'A universal database tool for developers and database administrators.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://dbeaver.io' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install dbeaver.io' as const,
  programs: ['dbeaver'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['24.3.4', '24.3.3'] as const,
  aliases: ['dbeaver'] as const,
}
export type DbeaverioPackage = typeof dbeaverioPackage
