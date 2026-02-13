/**
 * **bacon** - Background rust code check
 *
 * @domain `dystroy.org/bacon`
 * @programs `bacon`
 * @version `3.22.0` (18 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install dystroy.org/bacon`
 * @homepage https://dystroy.org/bacon/
 * @dependencies `linux:alsa-project.org/alsa-lib` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.dystroyorgbacon
 * console.log(pkg.name)        // "bacon"
 * console.log(pkg.description) // "Background rust code check"
 * console.log(pkg.programs)    // ["bacon"]
 * console.log(pkg.versions[0]) // "3.22.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/dystroy-org/bacon.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dystroyorgbaconPackage = {
  /**
   * The display name of this package.
   */
  name: 'bacon' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'dystroy.org/bacon' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Background rust code check' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dystroy.org/bacon/package.yml' as const,
  homepageUrl: 'https://dystroy.org/bacon/' as const,
  githubUrl: 'https://github.com/Canop/bacon' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install dystroy.org/bacon' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dystroy.org/bacon -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install dystroy.org/bacon' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bacon',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:alsa-project.org/alsa-lib',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.22.0',
    '3.21.0',
    '3.20.3',
    '3.20.2',
    '3.20.1',
    '3.19.0',
    '3.18.0',
    '3.17.0',
    '3.16.0',
    '3.15.0',
    '3.14.0',
    '3.13.0',
    '3.12.0',
    '3.11.0',
    '3.10.0',
    '3.9.1',
    '3.9.0',
    '3.8.0',
  ] as const,
  aliases: [] as const,
}

export type DystroyorgbaconPackage = typeof dystroyorgbaconPackage
