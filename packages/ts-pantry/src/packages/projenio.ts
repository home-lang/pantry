/**
 * **projen** - Rapidly build modern applications with advanced configuration management
 *
 * @domain `projen.io`
 * @programs `projen`
 * @version `0.99.7` (105 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install projen.io`
 * @homepage https://projen.io
 * @dependencies `nodejs.org^20 || ^18`
 * @buildDependencies `classic.yarnpkg.com@^1`, `npmjs.com@~11.4.2`, `maven.apache.org@>=3.0.0`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.projenio
 * console.log(pkg.name)        // "projen"
 * console.log(pkg.description) // "Rapidly build modern applications with advanced..."
 * console.log(pkg.programs)    // ["projen"]
 * console.log(pkg.versions[0]) // "0.99.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/projen-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const projenioPackage = {
  /**
   * The display name of this package.
   */
  name: 'projen' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'projen.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Rapidly build modern applications with advanced configuration management' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/projen.io/package.yml' as const,
  homepageUrl: 'https://projen.io' as const,
  githubUrl: 'https://github.com/projen/projen' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install projen.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +projen.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install projen.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'projen',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'nodejs.org^20 || ^18',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'classic.yarnpkg.com@^1',
    'npmjs.com@~11.4.2',
    'maven.apache.org@>=3.0.0',
    'python.org@~3.11',
    'go.dev@>=1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.99.7',
    '0.99.6',
    '0.99.5',
    '0.99.4',
    '0.99.3',
    '0.99.2',
    '0.99.1',
    '0.99.0',
    '0.98.34',
    '0.98.33',
    '0.98.32',
    '0.98.31',
    '0.98.30',
    '0.98.29',
    '0.98.28',
    '0.98.27',
    '0.98.26',
    '0.98.25',
    '0.98.24',
    '0.98.23',
    '0.98.22',
    '0.98.21',
    '0.98.20',
    '0.98.19',
    '0.98.18',
    '0.98.17',
    '0.98.16',
    '0.98.15',
    '0.98.14',
    '0.98.13',
    '0.98.12',
    '0.98.11',
    '0.98.10',
    '0.98.9',
    '0.98.8',
    '0.98.7',
    '0.98.6',
    '0.98.5',
    '0.98.4',
    '0.98.3',
    '0.98.2',
    '0.98.1',
    '0.98.0',
    '0.97.2',
    '0.97.1',
    '0.97.0',
    '0.96.5',
    '0.96.4',
    '0.96.3',
    '0.96.2',
    '0.96.1',
    '0.96.0',
    '0.95.6',
    '0.95.5',
    '0.95.4',
    '0.95.3',
    '0.95.2',
    '0.95.1',
    '0.95.0',
    '0.94.2',
    '0.94.1',
    '0.94.0',
    '0.93.3',
    '0.93.2',
    '0.93.1',
    '0.93.0',
    '0.92.12',
    '0.92.11',
    '0.92.10',
    '0.92.9',
    '0.92.8',
    '0.92.7',
    '0.92.6',
    '0.92.5',
    '0.92.4',
    '0.92.3',
    '0.92.2',
    '0.92.1',
    '0.92.0',
    '0.91.31',
    '0.91.30',
    '0.91.29',
    '0.91.28',
    '0.91.27',
    '0.91.26',
    '0.91.25',
    '0.91.24',
    '0.91.23',
    '0.91.22',
    '0.91.21',
    '0.91.20',
    '0.91.19',
    '0.91.18',
    '0.91.17',
    '0.91.16',
    '0.91.15',
    '0.91.14',
    '0.91.13',
    '0.91.12',
    '0.91.11',
    '0.91.10',
    '0.91.9',
    '0.91.8',
    '0.91.7',
    '0.91.6',
  ] as const,
  aliases: [] as const,
}

export type ProjenioPackage = typeof projenioPackage
