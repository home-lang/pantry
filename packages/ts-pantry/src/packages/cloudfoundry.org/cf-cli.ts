/**
 * **cf** - Filter to replace numeric timestamps with a formatted date time
 *
 * @domain `cloudfoundry.org/cf-cli`
 * @programs `cf`
 * @version `8.17.0` (32 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cloudfoundry.org/cf-cli`
 * @homepage https://ee.lbl.gov/
 * @buildDependencies `cmake.org@^3`, `go.dev@=1.23.1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cloudfoundryorgcfcli
 * console.log(pkg.name)        // "cf"
 * console.log(pkg.description) // "Filter to replace numeric timestamps with a for..."
 * console.log(pkg.programs)    // ["cf"]
 * console.log(pkg.versions[0]) // "8.17.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cloudfoundry-org/cf-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cloudfoundryorgcfcliPackage = {
  /**
   * The display name of this package.
   */
  name: 'cf' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'cloudfoundry.org/cf-cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Filter to replace numeric timestamps with a formatted date time' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cloudfoundry.org/cf-cli/package.yml' as const,
  homepageUrl: 'https://ee.lbl.gov/' as const,
  githubUrl: 'https://github.com/cloudfoundry/cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install cloudfoundry.org/cf-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cloudfoundry.org/cf-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cloudfoundry.org/cf-cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cf',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
    'go.dev@=1.23.1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '8.17.0',
    '8.16.0',
    '8.14.1',
    '8.14.0',
    '8.13.0',
    '8.12.0',
    '8.11.0',
    '8.10.0',
    '8.9.0',
    '8.8.3',
    '8.8.2',
    '8.8.1',
    '8.8.0',
    '8.7.11',
    '8.7.10',
    '8.7.9',
    '8.7.8',
    '8.7.7',
    '8.7.6',
    '8.7.5',
    '8.7.4',
    '7.8.0',
    '7.7.15',
    '7.7.14',
    '7.7.12',
    '7.7.11',
    '7.7.10',
    '7.7.9',
    '7.7.8',
    '7.7.7',
    '7.7.6',
    '7.7.5',
  ] as const,
  aliases: [] as const,
}

export type CloudfoundryorgcfcliPackage = typeof cloudfoundryorgcfcliPackage
