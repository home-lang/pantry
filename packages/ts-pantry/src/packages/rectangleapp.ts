/**
 * **Rectangle** - A window management app for macOS based on Spectacle.
 *
 * @domain `rectangle.app`
 * @programs `rectangle`
 * @version `0.83` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install rectangle.app`
 * @homepage https://rectangleapp.com
 */
export const rectangleappPackage = {
  name: 'Rectangle' as const,
  domain: 'rectangle.app' as const,
  description: 'A window management app for macOS based on Spectacle.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://rectangleapp.com' as const,
  githubUrl: 'https://github.com/rxhanson/Rectangle' as const,
  installCommand: 'pantry install rectangle.app' as const,
  programs: ['rectangle'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['0.83', '0.82', '0.81'] as const,
  aliases: ['rectangle'] as const,
}
export type RectangleappPackage = typeof rectangleappPackage
