/**
 * **fluentci** - Set up and run your CI locally or in any CI Provider in a consistent way https://backdropbuild.com/builds/v4/fluentci
 *
 * @domain `fluentci.io`
 * @programs `fluentci`
 * @version `0.16.8` (70 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fluentci.io`
 * @homepage https://fluentci.io
 * @dependencies `dagger.io^0.10`, `deno.land^1.42`, `charm.sh/glow^1.5.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fluentciio
 * console.log(pkg.name)        // "fluentci"
 * console.log(pkg.description) // "Set up and run your CI locally or in any CI Pro..."
 * console.log(pkg.programs)    // ["fluentci"]
 * console.log(pkg.versions[0]) // "0.16.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fluentci-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fluentciioPackage = {
  /**
   * The display name of this package.
   */
  name: 'fluentci' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'fluentci.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Set up and run your CI locally or in any CI Provider in a consistent way https://backdropbuild.com/builds/v4/fluentci' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fluentci.io/package.yml' as const,
  homepageUrl: 'https://fluentci.io' as const,
  githubUrl: 'https://github.com/fluentci-io/fluentci' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install fluentci.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fluentci.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fluentci.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fluentci',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'dagger.io^0.10',
    'deno.land^1.42',
    'charm.sh/glow^1.5.1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.16.8',
    '0.16.7',
    '0.16.5',
    '0.16.4',
    '0.16.3',
    '0.16.2',
    '0.16.1',
    '0.16.0',
    '0.15.9',
    '0.15.8',
    '0.15.7',
    '0.15.6',
    '0.15.5',
    '0.15.4',
    '0.15.3',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.9',
    '0.14.8',
    '0.14.7',
    '0.14.6',
    '0.14.5',
    '0.14.4',
    '0.14.3',
    '0.14.2',
    '0.14.1',
    '0.14.0',
    '0.13.2',
    '0.13.1',
    '0.13.0',
    '0.12.9',
    '0.12.8',
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
    '0.10.9',
    '0.10.8',
    '0.10.7',
    '0.10.6',
    '0.10.5',
    '0.10.4',
    '0.10.3',
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.1',
    '0.9.0',
    '0.8.1',
    '0.8.0',
    '0.7.1',
    '0.7.0',
    '0.6.9',
    '0.6.8',
    '0.6.7',
  ] as const,
  aliases: [] as const,
}

export type FluentciioPackage = typeof fluentciioPackage
