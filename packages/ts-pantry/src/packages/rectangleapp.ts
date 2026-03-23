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
  versions: [
    '0.94',
    '0.93',
    '0.92',
    '0.91',
    '0.90',
    '0.89',
    '0.88',
    '0.87',
    '0.86',
    '0.85',
    '0.84',
    '0.83',
    '0.82',
    '0.81',
    '0.80',
    '0.79',
    '0.77',
    '0.76',
    '0.75',
    '0.74',
  ] as const,
  aliases: ['rectangle'] as const,
}
export type RectangleappPackage = typeof rectangleappPackage
