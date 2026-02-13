/**
 * **micromamba** - The Fast Cross-Platform Package Manager
 *
 * @domain `github.com/mamba-org/micro`
 * @programs `micromamba`
 * @version `2.5.0` (30 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mamba-org/micro`
 * @homepage https://mamba.readthedocs.io
 * @dependencies `curl.se/ca-certs`
 * @buildDependencies `curl.se`, `sourceware.org/bzip2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommambaorgmicro
 * console.log(pkg.name)        // "micromamba"
 * console.log(pkg.description) // "The Fast Cross-Platform Package Manager"
 * console.log(pkg.programs)    // ["micromamba"]
 * console.log(pkg.versions[0]) // "2.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mamba-org/micro.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const microPackage = {
  /**
   * The display name of this package.
   */
  name: 'micromamba' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/mamba-org/micro' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The Fast Cross-Platform Package Manager' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mamba-org/micro/package.yml' as const,
  homepageUrl: 'https://mamba.readthedocs.io' as const,
  githubUrl: 'https://github.com/mamba-org/mamba' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/mamba-org/micro' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mamba-org/micro -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mamba-org/micro' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'micromamba',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'curl.se/ca-certs',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
    'sourceware.org/bzip2',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.5.0',
    '2.4.0',
    '2.3.3',
    '2.3.2',
    '2.3.1',
    '2.3.0',
    '2.2.0',
    '2.1.1',
    '2.1.0',
    '2.0.8',
    '2.0.7',
    '2.0.6',
    '2.0.5',
    '2.0.4',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.5.12',
    '1.5.11',
    '1.5.10',
    '1.5.9',
    '1.5.8',
    '1.5.7',
    '1.5.6',
    '1.5.5',
    '1.5.3',
    '1.5.1',
    '1.5.0',
    '1.4.9',
  ] as const,
  aliases: [] as const,
}

export type MicroPackage = typeof microPackage
