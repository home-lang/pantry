/**
 * **onefetch** - Command-line Git information tool
 *
 * @domain `onefetch.dev`
 * @programs `onefetch`
 * @version `2.26.1` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install onefetch.dev`
 * @homepage https://onefetch.dev/
 * @dependencies `libgit2.org~1.7 # links to libgit2.so.1.7`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.onefetchdev
 * console.log(pkg.name)        // "onefetch"
 * console.log(pkg.description) // "Command-line Git information tool"
 * console.log(pkg.programs)    // ["onefetch"]
 * console.log(pkg.versions[0]) // "2.26.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/onefetch-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const onefetchdevPackage = {
  /**
   * The display name of this package.
   */
  name: 'onefetch' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'onefetch.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command-line Git information tool' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/onefetch.dev/package.yml' as const,
  homepageUrl: 'https://onefetch.dev/' as const,
  githubUrl: 'https://github.com/o2sh/onefetch' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install onefetch.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +onefetch.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install onefetch.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'onefetch',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libgit2.org~1.7 # links to libgit2.so.1.7',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.26.1',
    '2.26.0',
    '2.25.0',
    '2.24.0',
    '2.23.1',
    '2.23.0',
    '2.22.0',
    '2.21.0',
    '2.20.0',
    '2.19.0',
    '2.18.1',
  ] as const,
  aliases: [] as const,
}

export type OnefetchdevPackage = typeof onefetchdevPackage
