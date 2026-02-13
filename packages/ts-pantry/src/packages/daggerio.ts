/**
 * **dagger** - An engine to run your pipelines in containers
 *
 * @domain `dagger.io`
 * @programs `dagger`
 * @version `0.19.10` (111 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install dagger.io`
 * @homepage https://dagger.io
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.daggerio
 * console.log(pkg.name)        // "dagger"
 * console.log(pkg.description) // "An engine to run your pipelines in containers"
 * console.log(pkg.programs)    // ["dagger"]
 * console.log(pkg.versions[0]) // "0.19.10" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/dagger-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const daggerioPackage = {
  /**
   * The display name of this package.
   */
  name: 'dagger' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'dagger.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'An engine to run your pipelines in containers' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dagger.io/package.yml' as const,
  homepageUrl: 'https://dagger.io' as const,
  githubUrl: 'https://github.com/dagger/dagger' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install dagger.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dagger.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install dagger.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dagger',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.19.10',
    '0.19.9',
    '0.19.8',
    '0.19.7',
    '0.19.6',
    '0.19.5',
    '0.19.4',
    '0.19.3',
    '0.19.2',
    '0.19.1',
    '0.19.0',
    '0.18.19',
    '0.18.18',
    '0.18.17',
    '0.18.16',
    '0.18.15',
    '0.18.14',
    '0.18.13',
    '0.18.12',
    '0.18.11',
    '0.18.10',
    '0.18.9',
    '0.18.8',
    '0.18.7',
    '0.18.6',
    '0.18.5',
    '0.18.4',
    '0.18.3',
    '0.18.2',
    '0.18.1',
    '0.18.0',
    '0.17.2',
    '0.17.1',
    '0.17.0',
    '0.16.3',
    '0.16.2',
    '0.16.1',
    '0.16.0',
    '0.15.4',
    '0.15.3',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.0',
    '0.13.7',
    '0.13.6',
    '0.13.5',
    '0.13.4',
    '0.13.3',
    '0.13.2',
    '0.13.1',
    '0.13.0',
    '0.12.7',
    '0.12.6',
    '0.12.5',
    '0.12.4',
    '0.12.3',
    '0.12.2',
    '0.12.1',
    '0.12.0',
    '0.11.9',
    '0.11.8',
    '0.11.7',
    '0.11.6',
    '0.11.5',
    '0.11.4',
    '0.11.3',
    '0.11.2',
    '0.11.1',
    '0.11.0',
    '0.10.3',
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.11',
    '0.9.10',
    '0.9.9',
    '0.9.8',
    '0.9.7',
    '0.9.6',
    '0.9.5',
    '0.9.4',
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.8',
    '0.8.7',
    '0.8.6',
    '0.8.5',
    '0.8.4',
    '0.8.3',
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.6.4',
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.3',
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.13',
    '0.3.12',
    '0.3.10',
    '0.3.9',
  ] as const,
  aliases: [] as const,
}

export type DaggerioPackage = typeof daggerioPackage
