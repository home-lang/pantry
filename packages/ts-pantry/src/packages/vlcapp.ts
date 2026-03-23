/**
 * **VLC** - A free and open-source cross-platform multimedia player.
 *
 * @domain `vlc.app`
 * @programs `vlc`
 * @version `3.0.21` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install vlc.app`
 * @homepage https://videolan.org
 */
export const vlcappPackage = {
  name: 'VLC' as const,
  domain: 'vlc.app' as const,
  description: 'A free and open-source cross-platform multimedia player.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://videolan.org' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install vlc.app' as const,
  programs: ['vlc'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['3.0.21', '3.0.20', '3.0.18'] as const,
  aliases: ['vlc'] as const,
}
export type VlcappPackage = typeof vlcappPackage
