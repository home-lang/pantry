/**
 * **xcbeautify** - A little beautifier tool for xcodebuild
 *
 * @domain `tuist.io/xcbeautify`
 * @programs `xcbeautify`
 * @version `3.1.2` (56 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tuist.io/xcbeautify`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tuistioxcbeautify
 * console.log(pkg.name)        // "xcbeautify"
 * console.log(pkg.description) // "A little beautifier tool for xcodebuild"
 * console.log(pkg.programs)    // ["xcbeautify"]
 * console.log(pkg.versions[0]) // "3.1.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tuist-io/xcbeautify.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tuistioxcbeautifyPackage = {
  /**
   * The display name of this package.
   */
  name: 'xcbeautify' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'tuist.io/xcbeautify' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A little beautifier tool for xcodebuild' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tuist.io/xcbeautify/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/cpisciotta/xcbeautify' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install tuist.io/xcbeautify' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tuist.io/xcbeautify -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tuist.io/xcbeautify' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'xcbeautify',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.1.2',
    '3.1.1',
    '3.1.0',
    '3.0.0',
    '2.30.1',
    '2.30.0',
    '2.29.0',
    '2.28.0',
    '2.27.0',
    '2.26.0',
    '2.25.1',
    '2.25.0',
    '2.24.0',
    '2.23.0',
    '2.22.0',
    '2.21.0',
    '2.20.0',
    '2.19.0',
    '2.18.0',
    '2.17.0',
    '2.16.1',
    '2.16.0',
    '2.15.0',
    '2.14.1',
    '2.14.0',
    '2.13.0',
    '2.12.0',
    '2.11.0',
    '2.10.1',
    '2.10.0',
    '2.9.0',
    '2.7.0',
    '2.5.0',
    '2.4.1',
    '2.4.0',
    '2.3.1',
    '2.3.0',
    '2.2.0',
    '2.1.1',
    '2.1.0',
    '2.0.1',
    '2.0.0',
    '1.7.0',
    '1.6.0',
    '1.5.0',
    '1.4.0',
    '1.3.1',
    '1.3.0',
    '1.2.0',
    '1.1.1',
    '1.1.0',
    '1.0.1',
    '1.0.0',
    '0.21.1',
    '0.21.0',
    '0.20.0',
  ] as const,
  aliases: [] as const,
}

export type TuistioxcbeautifyPackage = typeof tuistioxcbeautifyPackage
