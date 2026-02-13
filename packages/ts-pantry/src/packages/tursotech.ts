/**
 * **turso** - Command line interface to Turso.
 *
 * @domain `turso.tech`
 * @programs `turso`
 * @version `1.0.16` (95 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install turso.tech`
 * @homepage https://turso.tech
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tursotech
 * console.log(pkg.name)        // "turso"
 * console.log(pkg.description) // "Command line interface to Turso."
 * console.log(pkg.programs)    // ["turso"]
 * console.log(pkg.versions[0]) // "1.0.16" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/turso-tech.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tursotechPackage = {
  /**
   * The display name of this package.
   */
  name: 'turso' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'turso.tech' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command line interface to Turso.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/turso.tech/package.yml' as const,
  homepageUrl: 'https://turso.tech' as const,
  githubUrl: 'https://github.com/tursodatabase/turso-cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install turso.tech' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +turso.tech -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install turso.tech' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'turso',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.16',
    '1.0.15',
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
    '0.100.1',
    '0.100.0',
    '0.99.1',
    '0.99.0',
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
    '0.95.2',
    '0.95.1',
    '0.95.0',
    '0.94.0',
    '0.93.8',
    '0.93.7',
    '0.93.6',
    '0.93.5',
    '0.93.4',
    '0.93.3',
    '0.93.2',
    '0.93.1',
    '0.93.0',
    '0.92.1',
    '0.92.0',
    '0.91.1',
    '0.91.0',
    '0.90.7',
    '0.90.6',
    '0.90.5',
    '0.90.4',
    '0.90.3',
    '0.90.2',
    '0.90.1',
    '0.90.0',
    '0.89.0',
    '0.88.9',
    '0.88.8',
    '0.88.7',
    '0.88.6',
    '0.88.5',
    '0.88.4',
    '0.88.3',
    '0.88.2',
    '0.88.1',
    '0.88.0',
    '0.87.9',
    '0.87.8',
    '0.87.7',
    '0.87.6',
    '0.87.5',
    '0.87.4',
    '0.87.3',
    '0.87.2',
    '0.87.1',
    '0.87.0',
    '0.86.3',
    '0.86.2',
    '0.86.1',
    '0.86.0',
    '0.85.3',
    '0.85.2',
    '0.85.1',
    '0.85.0',
    '0.84.1',
    '0.84.0',
    '0.83.1',
    '0.83.0',
    '0.82.0',
    '0.81.0',
    '0.80.1',
    '0.80.0',
  ] as const,
  aliases: [] as const,
}

export type TursotechPackage = typeof tursotechPackage
