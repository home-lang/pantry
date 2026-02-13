/**
 * **trufflehog** - Find, verify, and analyze leaked credentials
 *
 * @domain `trufflesecurity.com/trufflehog`
 * @programs `trufflehog`
 * @version `3.92.5` (166 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install trufflesecurity.com/trufflehog`
 * @homepage https://trufflesecurity.com/
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.trufflesecuritycomtrufflehog
 * console.log(pkg.name)        // "trufflehog"
 * console.log(pkg.description) // "Find, verify, and analyze leaked credentials"
 * console.log(pkg.programs)    // ["trufflehog"]
 * console.log(pkg.versions[0]) // "3.92.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/trufflesecurity-com/trufflehog.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const trufflesecuritycomtrufflehogPackage = {
  /**
   * The display name of this package.
   */
  name: 'trufflehog' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'trufflesecurity.com/trufflehog' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Find, verify, and analyze leaked credentials' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/trufflesecurity.com/trufflehog/package.yml' as const,
  homepageUrl: 'https://trufflesecurity.com/' as const,
  githubUrl: 'https://github.com/trufflesecurity/trufflehog' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install trufflesecurity.com/trufflehog' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +trufflesecurity.com/trufflehog -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install trufflesecurity.com/trufflehog' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'trufflehog',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.92.5',
    '3.92.4',
    '3.92.3',
    '3.92.2',
    '3.92.1',
    '3.92.0',
    '3.91.2',
    '3.91.1',
    '3.91.0',
    '3.90.13',
    '3.90.12',
    '3.90.11',
    '3.90.10',
    '3.90.9',
    '3.90.8',
    '3.90.7',
    '3.90.6',
    '3.90.5',
    '3.90.4',
    '3.90.3',
    '3.90.2',
    '3.90.1',
    '3.90.0',
    '3.89.2',
    '3.89.1',
    '3.89.0',
    '3.88.35',
    '3.88.34',
    '3.88.33',
    '3.88.32',
    '3.88.31',
    '3.88.30',
    '3.88.29',
    '3.88.28',
    '3.88.27',
    '3.88.26',
    '3.88.25',
    '3.88.24',
    '3.88.23',
    '3.88.22',
    '3.88.21',
    '3.88.20',
    '3.88.19',
    '3.88.18',
    '3.88.17',
    '3.88.16',
    '3.88.15',
    '3.88.14',
    '3.88.13',
    '3.88.12',
    '3.88.11',
    '3.88.10',
    '3.88.9',
    '3.88.8',
    '3.88.7',
    '3.88.6',
    '3.88.5',
    '3.88.4',
    '3.88.3',
    '3.88.2',
    '3.88.1',
    '3.88.0',
    '3.87.2',
    '3.87.1',
    '3.87.0',
    '3.86.1',
    '3.86.0',
    '3.85.0',
    '3.84.2',
    '3.84.1',
    '3.84.0',
    '3.83.7',
    '3.83.6',
    '3.83.5',
    '3.83.4',
    '3.83.3',
    '3.83.2',
    '3.83.1',
    '3.83.0',
    '3.82.13',
    '3.82.12',
    '3.82.11',
    '3.82.10',
    '3.82.9',
    '3.82.8',
    '3.82.7',
    '3.82.6',
    '3.82.5',
    '3.82.4',
    '3.82.3',
    '3.82.2',
    '3.82.1',
    '3.82.0',
    '3.81.10',
    '3.81.9',
    '3.81.8',
    '3.81.7',
    '3.81.6',
    '3.81.5',
    '3.81.4',
    '3.81.3',
    '3.81.2',
    '3.81.1',
    '3.81.0',
    '3.80.6',
    '3.80.5',
    '3.80.4',
    '3.80.3',
    '3.80.2',
    '3.80.1',
    '3.80.0',
    '3.79.0',
    '3.78.2',
    '3.78.1',
    '3.78.0',
    '3.77.0',
    '3.76.3',
    '3.76.2',
    '3.76.1',
    '3.76.0',
    '3.75.1',
    '3.75.0',
    '3.74.0',
    '3.73.0',
    '3.72.0',
    '3.71.2',
    '3.71.1',
    '3.71.0',
    '3.70.3',
    '3.70.2',
    '3.70.1',
    '3.70.0',
    '3.69.0',
    '3.68.5',
    '3.68.4',
    '3.68.3',
    '3.68.2',
    '3.68.1',
    '3.68.0',
    '3.67.7',
    '3.67.6',
    '3.67.5',
    '3.67.4',
    '3.67.3',
    '3.67.2',
    '3.67.1',
    '3.67.0',
    '3.66.3',
    '3.66.2',
    '3.66.1',
    '3.66.0',
    '3.65.0',
    '3.64.0',
    '3.63.11',
    '3.63.10',
    '3.63.9',
    '3.63.8',
    '3.63.7',
    '3.63.6',
    '3.63.5',
    '3.63.4',
    '3.63.3',
    '3.63.2',
    '3.63.1',
    '3.63.0',
    '3.62.1',
  ] as const,
  aliases: [] as const,
}

export type TrufflesecuritycomtrufflehogPackage = typeof trufflesecuritycomtrufflehogPackage
