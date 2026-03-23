/**
 * **Firefox** - A free and open-source web browser.
 *
 * @domain `firefox.org`
 * @programs `firefox`
 * @version `134.0.2` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install firefox.org`
 * @homepage https://www.mozilla.org/firefox
 */
export const firefoxorgPackage = {
  name: 'Firefox' as const,
  domain: 'firefox.org' as const,
  description: 'A free and open-source web browser.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://www.mozilla.org/firefox' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install firefox.org' as const,
  programs: ['firefox'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['134.0.2', '134.0.1', '134.0'] as const,
  aliases: ['firefox'] as const,
}
export type FirefoxorgPackage = typeof firefoxorgPackage
