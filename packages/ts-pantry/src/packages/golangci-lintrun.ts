/**
 * **golangci-lint** - Fast linters runner for Go
 *
 * @domain `golangci-lint.run`
 * @programs `golangci-lint`
 * @version `2.8.0` (66 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install golangci-lint.run`
 * @homepage https://golangci-lint.run/
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.golangcilintrun
 * console.log(pkg.name)        // "golangci-lint"
 * console.log(pkg.description) // "Fast linters runner for Go"
 * console.log(pkg.programs)    // ["golangci-lint"]
 * console.log(pkg.versions[0]) // "2.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/golangci-lint-run.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const golangcilintrunPackage = {
  /**
   * The display name of this package.
   */
  name: 'golangci-lint' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'golangci-lint.run' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Fast linters runner for Go' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/golangci-lint.run/package.yml' as const,
  homepageUrl: 'https://golangci-lint.run/' as const,
  githubUrl: 'https://github.com/golangci/golangci-lint' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install golangci-lint.run' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +golangci-lint.run -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install golangci-lint.run' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'golangci-lint',
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
    '2.8.0',
    '2.7.2',
    '2.7.1',
    '2.7.0',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.0',
    '2.4.0',
    '2.3.1',
    '2.3.0',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.6',
    '2.1.5',
    '2.1.4',
    '2.1.3',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.64.8',
    '1.64.7',
    '1.64.6',
    '1.64.5',
    '1.64.4',
    '1.64.3',
    '1.64.2',
    '1.63.4',
    '1.63.3',
    '1.63.2',
    '1.63.1',
    '1.63.0',
    '1.62.2',
    '1.62.0',
    '1.61.0',
    '1.60.3',
    '1.60.2',
    '1.60.1',
    '1.59.1',
    '1.59.0',
    '1.58.2',
    '1.58.1',
    '1.58.0',
    '1.57.2',
    '1.57.1',
    '1.57.0',
    '1.56.2',
    '1.56.1',
    '1.56.0',
    '1.55.2',
    '1.55.1',
    '1.55.0',
    '1.54.2',
    '1.54.1',
    '1.53.3',
    '1.53.2',
    '1.53.1',
    '1.53.0',
    '1.52.2',
    '1.52.1',
    '1.52.0',
    '1.51.2',
  ] as const,
  aliases: [] as const,
}

export type GolangcilintrunPackage = typeof golangcilintrunPackage
