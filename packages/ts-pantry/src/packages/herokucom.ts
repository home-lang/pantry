/**
 * **heroku** - CLI for Heroku
 *
 * @domain `heroku.com`
 * @programs `heroku`
 * @version `10.17.0` (43 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install heroku.com`
 * @homepage https://www.npmjs.com/package/heroku/
 * @dependencies `nodejs.org^20`
 * @buildDependencies `npmjs.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.herokucom
 * console.log(pkg.name)        // "heroku"
 * console.log(pkg.description) // "CLI for Heroku"
 * console.log(pkg.programs)    // ["heroku"]
 * console.log(pkg.versions[0]) // "10.17.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/heroku-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const herokucomPackage = {
  /**
  * The display name of this package.
  */
  name: 'heroku' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'heroku.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'CLI for Heroku' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/heroku.com/package.yml' as const,
  homepageUrl: 'https://www.npmjs.com/package/heroku/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install heroku.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +heroku.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install heroku.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'heroku',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'nodejs.org^20',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'npmjs.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '10.17.0',
    '10.16.0',
    '10.15.1',
    '10.15.0',
    '10.14.0',
    '10.13.2',
    '10.13.1',
    '10.13.0',
    '10.12.0',
    '10.11.0',
    '10.10.1',
    '10.10.0',
    '10.9.0',
    '10.8.0',
    '10.7.0',
    '10.6.1',
    '10.6.0',
    '10.5.0',
    '10.4.1',
    '10.4.0',
    '10.3.0',
    '10.2.0',
    '10.1.0',
    '10.0.2',
    '10.0.1',
    '10.0.0',
    '9.5.1',
    '9.5.0',
    '9.4.0',
    '9.3.2',
    '9.3.1',
    '9.3.0',
    '9.2.1',
    '9.2.0',
    '9.1.0',
    '9.0.0',
    '8.11.5',
    '8.11.4',
    '8.11.3',
    '8.11.2',
    '8.11.1',
    '8.11.0',
    '8.10.0',
  ] as const,
  aliases: [] as const,
}

export type HerokucomPackage = typeof herokucomPackage
