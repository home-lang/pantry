/**
 * **Element** - A decentralized, encrypted messaging and collaboration client built on Matrix.
 *
 * @domain `element.io`
 * @programs `element`
 * @version `1.11.86` (2 versions available)
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
  versions: ['1.11.86', '1.11.85'] as const,
  aliases: ['element'] as const,
}
export type ElementioPackage = typeof elementioPackage
