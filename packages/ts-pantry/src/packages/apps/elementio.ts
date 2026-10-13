/**
 * **Element** - A decentralized, encrypted messaging and collaboration client built on Matrix.
 *
 * @domain `element.io`
 * @programs `element`
 * @version `1.12.31` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install element.io`
 * @homepage https://element.io
 */
export const elementioPackage = {
  name: 'Element' as const,
  domain: 'element.io' as const,
  description: 'A decentralized, encrypted messaging and collaboration client built on Matrix.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://element.io' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install element.io' as const,
  programs: ['element'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: [
    '1.12.31',
    '1.12.30',
    '1.12.29',
    '1.12.28',
    '1.12.27',
    '1.12.26',
    '1.12.25',
    '1.12.24',
    '1.12.23',
    '1.12.22',
    '1.11.86',
    '1.11.85',
  ] as const,
  aliases: ['element'] as const,
}
export type ElementioPackage = typeof elementioPackage
