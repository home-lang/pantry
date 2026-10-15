/**
 * **Tunnelblick** - A free, open-source graphic user interface for OpenVPN on macOS.
 *
 * @domain `tunnelblick.net`
 * @programs `tunnelblick`
 * @version `10.0` (22 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install tunnelblick.net`
 * @homepage https://tunnelblick.net
 */
export const tunnelblicknetPackage = {
  name: 'Tunnelblick' as const,
  domain: 'tunnelblick.net' as const,
  description: 'A free, open-source graphic user interface for OpenVPN on macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://tunnelblick.net' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install tunnelblick.net' as const,
  programs: ['tunnelblick'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: [
    '10.0',
    '9.0.1',
    '9.0',
    '8.0.3',
    '8.0.2',
    '8.0.1',
    '8.0',
    '7.0',
    '6.0.1',
    '6.0',
    '4.0.1',
    '4.0.0',
    '3.8.8g',
    '3.8.8f',
    '3.8.8e',
    '3.8.8d',
    '3.8.8c',
    '3.8.8b',
    '3.8.8a',
    '3.8.8',
    '3.8.7a',
    '3.5.26',
  ] as const,
  aliases: ['tunnelblick'] as const,
}
export type TunnelblicknetPackage = typeof tunnelblicknetPackage
