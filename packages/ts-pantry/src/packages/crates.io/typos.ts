/**
 * **typos** - Source code spell checker
 *
 * @domain `crates.io/typos`
 * @programs `typos`
 * @version `1.42.1` (128 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/typos`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiotypos
 * console.log(pkg.name)        // "typos"
 * console.log(pkg.description) // "Source code spell checker"
 * console.log(pkg.programs)    // ["typos"]
 * console.log(pkg.versions[0]) // "1.42.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/typos.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiotyposPackage = {
  /**
   * The display name of this package.
   */
  name: 'typos' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/typos' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Source code spell checker' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/typos/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/crate-ci/typos' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/typos' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/typos -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/typos' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'typos',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.42.1',
    '1.42.0',
    '1.41.0',
    '1.40.1',
    '1.40.0',
    '1.39.2',
    '1.39.1',
    '1.39.0',
    '1.38.1',
    '1.38.0',
    '1.37.3',
    '1.37.2',
    '1.37.1',
    '1.37.0',
    '1.36.3',
    '1.36.2',
    '1.36.1',
    '1.36.0',
    '1.35.8',
    '1.35.7',
    '1.35.6',
    '1.35.5',
    '1.35.4',
    '1.35.3',
    '1.35.2',
    '1.35.1',
    '1.35.0',
    '1.34.0',
    '1.33.1',
    '1.33.0',
    '1.32.0',
    '1.31.2',
    '1.31.1',
    '1.31.0',
    '1.30.3',
    '1.30.2',
    '1.30.1',
    '1.30.0',
    '1.29.10',
    '1.29.9',
    '1.29.8',
    '1.29.7',
    '1.29.6',
    '1.29.5',
    '1.29.4',
    '1.29.3',
    '1.29.1',
    '1.29.0',
    '1.28.4',
    '1.28.3',
    '1.28.2',
    '1.28.1',
    '1.28.0',
    '1.27.3',
    '1.27.2',
    '1.27.1',
    '1.27.0',
    '1.26.8',
    '1.26.3',
    '1.26.2',
    '1.26.1',
    '1.26.0',
    '1.25.0',
    '1.24.6',
    '1.24.5',
    '1.24.4',
    '1.24.3',
    '1.24.2',
    '1.24.1',
    '1.24.0',
    '1.23.7',
    '1.23.6',
    '1.23.5',
    '1.23.4',
    '1.23.3',
    '1.23.2',
    '1.23.1',
    '1.23.0',
    '1.22.9',
    '1.22.8',
    '1.22.7',
    '1.22.6',
    '1.22.5',
    '1.22.4',
    '1.22.3',
    '1.22.2',
    '1.22.1',
    '1.22.0',
    '1.21.0',
    '1.20.10',
    '1.20.9',
    '1.20.8',
    '1.20.7',
    '1.20.6',
    '1.20.5',
    '1.20.4',
    '1.20.3',
    '1.20.2',
    '1.20.1',
    '1.20.0',
    '1.19.0',
    '1.18.2',
    '1.18.1',
    '1.18.0',
    '1.17.2',
    '1.17.1',
    '1.17.0',
    '1.16.26',
    '1.16.25',
    '1.16.24',
    '1.16.23',
    '1.16.22',
    '1.16.21',
    '1.16.20',
    '1.16.19',
    '1.16.18',
    '1.16.17',
    '1.16.16',
    '1.16.15',
    '1.16.14',
    '1.16.13',
    '1.16.12',
    '1.16.11',
    '1.16.10',
    '1.16.9',
    '1.16.8',
    '1.16.7',
    '1.16.6',
  ] as const,
  aliases: [] as const,
}

export type CratesiotyposPackage = typeof cratesiotyposPackage
