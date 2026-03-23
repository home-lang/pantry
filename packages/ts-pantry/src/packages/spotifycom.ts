/**
 * **Spotify** - A digital music streaming service.
 *
 * @domain `spotify.com`
 * @programs `spotify`
 * @version `1.2.52` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install spotify.com`
 * @homepage https://spotify.com
 */
export const spotifycomPackage = {
  name: 'Spotify' as const,
  domain: 'spotify.com' as const,
  description: 'A digital music streaming service.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://spotify.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install spotify.com' as const,
  programs: ['spotify'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.2.52', '1.2.51', '1.2.50'] as const,
  aliases: ['spotify'] as const,
}
export type SpotifycomPackage = typeof spotifycomPackage
