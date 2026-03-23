/**
 * **Transmit** - A file transfer client for macOS.
 *
 * @domain `transmit.panic.com`
 * @programs `transmit`
 * @version `5.10.7` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install transmit.panic.com`
 * @homepage https://panic.com/transmit
 */
export const transmitpaniccomPackage = {
  name: 'Transmit' as const,
  domain: 'transmit.panic.com' as const,
  description: 'A file transfer client for macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://panic.com/transmit' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install transmit.panic.com' as const,
  programs: ['transmit'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['5.10.7', '5.10.6'] as const,
  aliases: ['transmit'] as const,
}
export type TransmitpaniccomPackage = typeof transmitpaniccomPackage
