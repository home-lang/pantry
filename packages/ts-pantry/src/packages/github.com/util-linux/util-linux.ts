/**
 * **util-linux** - pkgx package
 *
 * @domain `github.com/util-linux/util-linux`
 * @programs `cal`, `colcrt`, `colrm`, `column`, `flock`, ... (+16 more)
 * @version `2.41.3` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/util-linux/util-linux`
 * @homepage http://en.wikipedia.org/wiki/Util-linux
 * @dependencies `gnu.org/gettext^0`, `sqlite.org^3`
 * @buildDependencies `gnu.org/bison`, `gnu.org/patch`, `darwin:llvm.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomutillinuxutillinux
 * console.log(pkg.name)        // "util-linux"
 * console.log(pkg.programs)    // ["cal", "colcrt", ...]
 * console.log(pkg.versions[0]) // "2.41.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/util-linux/util-linux.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const utillinuxPackage = {
  /**
   * The display name of this package.
   */
  name: 'util-linux' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/util-linux/util-linux' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/util-linux/util-linux/package.yml' as const,
  homepageUrl: 'http://en.wikipedia.org/wiki/Util-linux' as const,
  githubUrl: 'https://github.com/util-linux/util-linux' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/util-linux/util-linux' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/util-linux/util-linux -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/util-linux/util-linux' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cal',
    'colcrt',
    'colrm',
    'column',
    'flock',
    'getopt',
    'hardlink',
    'hexdump',
    'isosize',
    'logger',
    'look',
    'mcookie',
    'mesg',
    'namei',
    'rename',
    'renice',
    'rev',
    'scriptreplay',
    'setsid',
    'wall',
    'whereis',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/gettext^0',
    'sqlite.org^3',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/bison',
    'gnu.org/patch',
    'darwin:llvm.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.41.3',
    '2.41.2',
    '2.41.1',
    '2.41.0',
    '2.40.4',
    '2.40.3',
    '2.40.2',
    '2.40.1',
    '2.40.0',
    '2.39.4',
    '2.39.3',
    '2.39.2',
    '2.39.1',
    '2.39.0',
    '2.38.1',
  ] as const,
  aliases: [] as const,
}

export type UtillinuxPackage = typeof utillinuxPackage
