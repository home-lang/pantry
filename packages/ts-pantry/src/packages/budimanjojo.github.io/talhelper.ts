/**
 * **talhelper** - A tool to help creating Talos kubernetes cluster
 *
 * @domain `budimanjojo.github.io/talhelper`
 * @programs `talhelper`
 * @version `3.1.3` (69 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install budimanjojo.github.io/talhelper`
 * @homepage https://budimanjojo.github.io/talhelper/latest/
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.budimanjojogithubiotalhelper
 * console.log(pkg.name)        // "talhelper"
 * console.log(pkg.description) // "A tool to help creating Talos kubernetes cluster"
 * console.log(pkg.programs)    // ["talhelper"]
 * console.log(pkg.versions[0]) // "3.1.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/budimanjojo-github-io/talhelper.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const budimanjojogithubiotalhelperPackage = {
  /**
   * The display name of this package.
   */
  name: 'talhelper' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'budimanjojo.github.io/talhelper' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A tool to help creating Talos kubernetes cluster' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/budimanjojo.github.io/talhelper/package.yml' as const,
  homepageUrl: 'https://budimanjojo.github.io/talhelper/latest/' as const,
  githubUrl: 'https://github.com/budimanjojo/talhelper' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install budimanjojo.github.io/talhelper' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +budimanjojo.github.io/talhelper -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install budimanjojo.github.io/talhelper' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'talhelper',
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
    '3.1.3',
    '3.1.2',
    '3.1.1',
    '3.1.0',
    '3.0.45',
    '3.0.44',
    '3.0.43',
    '3.0.42',
    '3.0.41',
    '3.0.40',
    '3.0.39',
    '3.0.38',
    '3.0.37',
    '3.0.36',
    '3.0.35',
    '3.0.34',
    '3.0.33',
    '3.0.32',
    '3.0.31',
    '3.0.30',
    '3.0.29',
    '3.0.28',
    '3.0.27',
    '3.0.26',
    '3.0.25',
    '3.0.24',
    '3.0.23',
    '3.0.22',
    '3.0.21',
    '3.0.20',
    '3.0.19',
    '3.0.18',
    '3.0.17',
    '3.0.16',
    '3.0.15',
    '3.0.14',
    '3.0.13',
    '3.0.12',
    '3.0.11',
    '3.0.10',
    '3.0.9',
    '3.0.8',
    '3.0.7',
    '3.0.6',
    '3.0.5',
    '3.0.4',
    '3.0.3',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.4.10',
    '2.4.9',
    '2.4.8',
    '2.4.7',
    '2.4.6',
    '2.4.5',
    '2.4.4',
    '2.4.3',
    '2.4.2',
    '2.4.1',
    '2.4.0',
    '2.3.11',
    '2.3.10',
    '2.3.9',
    '2.3.8',
    '2.3.7',
    '2.3.6',
    '2.3.5',
    '2.3.4',
  ] as const,
  aliases: [] as const,
}

export type BudimanjojogithubiotalhelperPackage = typeof budimanjojogithubiotalhelperPackage
