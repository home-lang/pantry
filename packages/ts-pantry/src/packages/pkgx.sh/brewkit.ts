/**
 * **brewkit** - build infra & `$ bk build`
 *
 * @domain `pkgx.sh/brewkit`
 * @programs `bk`
 * @version `1.16.0` (61 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pkgx.sh/brewkit`
 * @dependencies `deno.land~1.39  # 1.40 shouts unskippable deprecation warnings`, `gnu.org/bash^5`, `pkgx.sh^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.pkgxshbrewkit
 * console.log(pkg.name)        // "brewkit"
 * console.log(pkg.description) // "build infra & `$ bk build`"
 * console.log(pkg.programs)    // ["bk"]
 * console.log(pkg.versions[0]) // "1.16.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pkgx-sh/brewkit.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pkgxshbrewkitPackage = {
  /**
   * The display name of this package.
   */
  name: 'brewkit' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pkgx.sh/brewkit' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'build infra & `$ bk build`' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/brewkit/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/pkgxdev/brewkit' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pkgx.sh/brewkit' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pkgx.sh/brewkit -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pkgx.sh/brewkit' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bk',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'deno.land~1.39  # 1.40 shouts unskippable deprecation warnings',
    'gnu.org/bash^5',
    'pkgx.sh^1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.16.0',
    '1.15.0',
    '1.14.3',
    '1.14.2',
    '1.14.1',
    '1.13.0',
    '1.12.0',
    '1.11.2',
    '1.11.1',
    '1.11.0',
    '1.10.7',
    '1.10.6',
    '1.10.5',
    '1.10.4',
    '1.10.3',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.0',
    '1.8.2',
    '1.8.1',
    '1.8.0',
    '1.7.0',
    '1.6.0',
    '1.5.1',
    '1.5.0',
    '1.4.0',
    '1.3.1',
    '1.3.0',
    '1.2.4',
    '1.2.3',
    '1.2.2',
    '1.2.1',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.55.8',
    '0.55.7',
    '0.55.6',
    '0.55.5',
    '0.55.4',
    '0.55.3',
    '0.55.2',
    '0.55.1',
    '0.55.0',
    '0.54.0',
    '0.53.0',
    '0.52.1',
    '0.52.0',
    '0.51.0',
    '0.50.0',
    '0.49.0',
    '0.48.0',
    '0.47.0',
    '0.46.4',
    '0.46.3',
    '0.46.2',
    '0.46.1',
  ] as const,
  aliases: [] as const,
}

export type PkgxshbrewkitPackage = typeof pkgxshbrewkitPackage
