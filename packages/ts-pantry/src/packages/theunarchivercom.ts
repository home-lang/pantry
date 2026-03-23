/**
 * **The Unarchiver** - A multi-format archive decompressor for macOS.
 *
 * @domain `the-unarchiver.com`
 * @programs `unar`, `lsar`
 * @version `5.7.3` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install the-unarchiver.com`
 * @homepage https://theunarchiver.com
 */
export const theunarchivercomPackage = {
  name: 'The Unarchiver' as const,
  domain: 'the-unarchiver.com' as const,
  description: 'A multi-format archive decompressor for macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://theunarchiver.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install the-unarchiver.com' as const,
  programs: ['unar', 'lsar'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['5.7.3', '5.7.2'] as const,
  aliases: ['the-unarchiver', 'unar'] as const,
}
export type TheunarchivercomPackage = typeof theunarchivercomPackage
