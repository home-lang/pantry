/**
 * **chomp** - 'JS Make' - parallel task runner for the frontend ecosystem with a JS extension system.
 *
 * @domain `chompbuild.com`
 * @programs `chomp`
 * @version `0.2.23` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install chompbuild.com`
 * @homepage https://chompbuild.com
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.chompbuildcom
 * console.log(pkg.name)        // "chomp"
 * console.log(pkg.description) // "'JS Make' - parallel task runner for the fronte..."
 * console.log(pkg.programs)    // ["chomp"]
 * console.log(pkg.versions[0]) // "0.2.23" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/chompbuild-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const chompbuildcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'chomp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'chompbuild.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: '\'JS Make\' - parallel task runner for the frontend ecosystem with a JS extension system.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/chompbuild.com/package.yml' as const,
  homepageUrl: 'https://chompbuild.com' as const,
  githubUrl: 'https://github.com/guybedford/chomp' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install chompbuild.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +chompbuild.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install chompbuild.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'chomp',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.2.23',
  ] as const,
  aliases: [] as const,
}

export type ChompbuildcomPackage = typeof chompbuildcomPackage
