/**
 * **bun** - Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one
 *
 * @domain `bun.sh`
 * @programs `bun`, `bunx`
 * @version `1.3.6` (134 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install bun.sh`
 * @name `bun`
 * @aliases `bun.com`
 * @homepage https://bun.sh
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * // Access the package
 * const pkg = pantry.bun
 * // Or access via domain
 * const samePkg = pantry.bunsh
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "bun"
 * console.log(pkg.description) // "Incredibly fast JavaScript runtime, bundler, te..."
 * console.log(pkg.programs)    // ["bun", "bunx"]
 * console.log(pkg.versions[0]) // "1.3.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/bun-sh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const bunPackage = {
  /**
   * The display name of this package.
   */
  name: 'bun' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'bun.sh' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/bun.sh/package.yml' as const,
  homepageUrl: 'https://bun.sh' as const,
  githubUrl: 'https://github.com/oven-sh/bun' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install bun.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +bun.sh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install bun.sh' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bun',
    'bunx',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.6',
    '1.3.5',
    '1.3.4',
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.23',
    '1.2.22',
    '1.2.21',
    '1.2.20',
    '1.2.19',
    '1.2.18',
    '1.2.17',
    '1.2.16',
    '1.2.15',
    '1.2.14',
    '1.2.13',
    '1.2.12',
    '1.2.11',
    '1.2.10',
    '1.2.9',
    '1.2.8',
    '1.2.7',
    '1.2.6',
    '1.2.5',
    '1.2.4',
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.2.0',
    '1.1.45',
    '1.1.44',
    '1.1.43',
    '1.1.42',
    '1.1.41',
    '1.1.40',
    '1.1.39',
    '1.1.38',
    '1.1.37',
    '1.1.36',
    '1.1.35',
    '1.1.34',
    '1.1.33',
    '1.1.32',
    '1.1.31',
    '1.1.30',
    '1.1.29',
    '1.1.28',
    '1.1.27',
    '1.1.26',
    '1.1.25',
    '1.1.24',
    '1.1.23',
    '1.1.22',
    '1.1.21',
    '1.1.20',
    '1.1.19',
    '1.1.18',
    '1.1.17',
    '1.1.16',
    '1.1.15',
    '1.1.14',
    '1.1.13',
    '1.1.12',
    '1.1.11',
    '1.1.10',
    '1.1.9',
    '1.1.8',
    '1.1.7',
    '1.1.6',
    '1.1.5',
    '1.1.4',
    '1.1.3',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.36',
    '1.0.35',
    '1.0.34',
    '1.0.33',
    '1.0.32',
    '1.0.31',
    '1.0.30',
    '1.0.29',
    '1.0.28',
    '1.0.27',
    '1.0.26',
    '1.0.25',
    '1.0.24',
    '1.0.23',
    '1.0.22',
    '1.0.21',
    '1.0.20',
    '1.0.19',
    '1.0.18',
    '1.0.17',
    '1.0.16',
    '1.0.14',
    '1.0.13',
    '1.0.12',
    '1.0.11',
    '1.0.10',
    '1.0.9',
    '1.0.8',
    '1.0.7',
    '1.0.6',
    '1.0.5',
    '1.0.4',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.8.1',
    '0.8.0',
    '0.7.2',
    '0.7.1',
    '0.7.0',
    '0.6.14',
    '0.6.13',
    '0.6.12',
    '0.6.11',
    '0.6.10',
    '0.6.8',
    '0.6.7',
    '0.6.6',
    '0.6.5',
    '0.6.4',
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.9',
    '0.5.6',
  ] as const,
  /**
   * Alternative names for this package.
   * You can use any of these names to access the package.
   */
  aliases: [
    'bun.com',
  ] as const,
}

export type BunPackage = typeof bunPackage
