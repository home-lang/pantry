/**
 * **Tunnelblick** - A free, open-source graphic user interface for OpenVPN on macOS.
 *
 * @domain `tunnelblick.net`
 * @programs `tunnelblick`
 * @version `4.0.1` (2 versions available)
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
  versions: ['4.0.1', '4.0.0'] as const,
  aliases: ['tunnelblick'] as const,
}
export type TunnelblicknetPackage = typeof tunnelblicknetPackage
