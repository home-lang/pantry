/**
 * **ng** - CLI tool for Angular
 *
 * @domain `angular.dev`
 * @programs `ng`
 * @version `21.1.1` (151 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install angular.dev`
 * @homepage https://angular.dev/cli/
 * @dependencies `nodejs.org^20`
 * @buildDependencies `npmjs.com@^10` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.angulardev
 * console.log(pkg.name)        // "ng"
 * console.log(pkg.description) // "CLI tool for Angular"
 * console.log(pkg.programs)    // ["ng"]
 * console.log(pkg.versions[0]) // "21.1.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/angular-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const angulardevPackage = {
  /**
   * The display name of this package.
   */
  name: 'ng' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'angular.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'CLI tool for Angular' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/angular.dev/package.yml' as const,
  homepageUrl: 'https://angular.dev/cli/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install angular.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +angular.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install angular.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ng',
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
    'npmjs.com@^10',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '21.1.1',
    '21.1.0',
    '21.0.6',
    '21.0.5',
    '21.0.4',
    '21.0.3',
    '21.0.2',
    '21.0.1',
    '21.0.0',
    '20.3.15',
    '20.3.14',
    '20.3.12',
    '20.3.11',
    '20.3.10',
    '20.3.9',
    '20.3.8',
    '20.3.7',
    '20.3.6',
    '20.3.5',
    '20.3.4',
    '20.3.3',
    '20.3.2',
    '20.3.1',
    '20.3.0',
    '20.2.2',
    '20.2.1',
    '20.2.0',
    '20.1.6',
    '20.1.5',
    '20.1.4',
    '20.1.3',
    '20.1.2',
    '20.1.1',
    '20.1.0',
    '20.0.6',
    '20.0.5',
    '20.0.4',
    '20.0.3',
    '20.0.2',
    '20.0.1',
    '20.0.0',
    '19.2.19',
    '19.2.18',
    '19.2.17',
    '19.2.16',
    '19.2.15',
    '19.2.14',
    '19.2.13',
    '19.2.12',
    '19.2.11',
    '19.2.10',
    '19.2.9',
    '19.2.8',
    '19.2.7',
    '19.2.6',
    '19.2.5',
    '19.2.4',
    '19.2.3',
    '19.2.2',
    '19.2.1',
    '19.2.0',
    '19.1.9',
    '19.1.8',
    '19.1.7',
    '19.1.6',
    '19.1.5',
    '19.1.4',
    '19.1.3',
    '19.1.2',
    '19.1.1',
    '19.1.0',
    '19.0.7',
    '19.0.6',
    '19.0.5',
    '19.0.4',
    '19.0.3',
    '19.0.2',
    '19.0.1',
    '19.0.0',
    '18.2.21',
    '18.2.20',
    '18.2.19',
    '18.2.18',
    '18.2.17',
    '18.2.16',
    '18.2.15',
    '18.2.14',
    '18.2.13',
    '18.2.12',
    '18.2.11',
    '18.2.10',
    '18.2.9',
    '18.2.8',
    '18.2.7',
    '18.2.6',
    '18.2.5',
    '18.2.4',
    '18.2.3',
    '18.2.2',
    '18.2.1',
    '18.2.0',
    '18.1.4',
    '18.1.3',
    '18.1.2',
    '18.1.1',
    '18.1.0',
    '18.0.7',
    '18.0.6',
    '18.0.5',
    '18.0.4',
    '18.0.3',
    '18.0.2',
    '18.0.1',
    '18.0.0',
    '17.3.17',
    '17.3.16',
    '17.3.15',
    '17.3.14',
    '17.3.13',
    '17.3.12',
    '17.3.11',
    '17.3.10',
    '17.3.9',
    '17.3.8',
    '17.3.7',
    '17.3.6',
    '17.3.5',
    '17.3.4',
    '17.3.3',
    '17.3.2',
    '17.3.1',
    '17.3.0',
    '17.2.3',
    '17.2.2',
    '17.2.1',
    '17.2.0',
    '17.1.4',
    '17.1.3',
    '17.1.2',
    '17.1.1',
    '17.1.0',
    '17.0.10',
    '17.0.9',
    '17.0.8',
    '17.0.7',
    '17.0.6',
    '17.0.5',
    '16.2.16',
    '16.2.15',
    '16.2.14',
    '15.2.11',
  ] as const,
  aliases: [] as const,
}

export type AngulardevPackage = typeof angulardevPackage
