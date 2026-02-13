/**
 * **man-db** - pkgx package
 *
 * @domain `man-db.gitlab.io/man-db`
 * @programs `apropos`, `catman`, `lexgrog`, `man`, `mandb`, ... (+3 more)
 * @version `2.13.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install man-db.gitlab.io/man-db`
 * @dependencies `libpipeline.gitlab.io/libpipeline`, `gnu.org/groff`, `linux:gnu.org/gdbm` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mandbgitlabiomandb
 * console.log(pkg.name)        // "man-db"
 * console.log(pkg.programs)    // ["apropos", "catman", ...]
 * console.log(pkg.versions[0]) // "2.13.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/man-db-gitlab-io/man-db.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mandbgitlabiomandbPackage = {
  /**
   * The display name of this package.
   */
  name: 'man-db' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'man-db.gitlab.io/man-db' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/man-db.gitlab.io/man-db/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install man-db.gitlab.io/man-db' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +man-db.gitlab.io/man-db -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install man-db.gitlab.io/man-db' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'apropos',
    'catman',
    'lexgrog',
    'man',
    'mandb',
    'manpath',
    'man-recode',
    'whatis',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'libpipeline.gitlab.io/libpipeline',
    'gnu.org/groff',
    'linux:gnu.org/gdbm',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.13.1',
    '2.13.0',
    '2.12.1',
    '2.12.0',
    '2.11.2',
  ] as const,
  aliases: [] as const,
}

export type MandbgitlabiomandbPackage = typeof mandbgitlabiomandbPackage
