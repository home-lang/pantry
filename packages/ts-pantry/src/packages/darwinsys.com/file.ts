/**
 * **file** - Read-only mirror of file CVS repository, updated every half hour. NOTE: do not make pull requests here, nor comment any commits, submit them usual way to bug tracker or to the mailing list. Maintainer(s) are not tracking  this git mirror.
 *
 * @domain `darwinsys.com/file`
 * @programs `file`
 * @version `5.46.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install darwinsys.com/file`
 * @homepage https://darwinsys.com/file/
 * @dependencies `zlib.net^1 #FIXME this is actually an optional dep`
 * @buildDependencies `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.darwinsyscomfile
 * console.log(pkg.name)        // "file"
 * console.log(pkg.description) // "Read-only mirror of file CVS repository, update..."
 * console.log(pkg.programs)    // ["file"]
 * console.log(pkg.versions[0]) // "5.46.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/darwinsys-com/file.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const darwinsyscomfilePackage = {
  /**
   * The display name of this package.
   */
  name: 'file' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'darwinsys.com/file' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Read-only mirror of file CVS repository, updated every half hour. NOTE: do not make pull requests here, nor comment any commits, submit them usual way to bug tracker or to the mailing list. Maintainer(s) are not tracking  this git mirror.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/darwinsys.com/file/package.yml' as const,
  homepageUrl: 'https://darwinsys.com/file/' as const,
  githubUrl: 'https://github.com/file/file' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install darwinsys.com/file' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +darwinsys.com/file -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install darwinsys.com/file' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'file',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net^1 #FIXME this is actually an optional dep',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/patch',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.46.0',
    '5.45.0',
    '5.43.0',
  ] as const,
  aliases: [] as const,
}

export type DarwinsyscomfilePackage = typeof darwinsyscomfilePackage
