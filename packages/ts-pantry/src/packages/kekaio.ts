/**
 * **Keka** - A file archiver for macOS.
 *
 * @domain `keka.io`
 * @programs `keka`
 * @version `1.4.7` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install keka.io`
 * @homepage https://keka.io
 */
export const kekaioPackage = {
  name: 'Keka' as const,
  domain: 'keka.io' as const,
  description: 'A file archiver for macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://keka.io' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install keka.io' as const,
  programs: ['keka'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.4.7', '1.4.6'] as const,
  aliases: ['keka'] as const,
}
export type KekaioPackage = typeof kekaioPackage
