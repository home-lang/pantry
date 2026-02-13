/**
 * **fusermount3** - The reference implementation of the Linux FUSE (Filesystem in Userspace) interface
 *
 * @domain `github.com/libfuse/libfuse`
 * @programs `fusermount3`
 * @version `3.18.1` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/libfuse/libfuse`
 * @buildDependencies `mesonbuild.com`, `linux:gnu.org/gcc@14`, `linux:gnu.org/gettext` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlibfuselibfuse
 * console.log(pkg.name)        // "fusermount3"
 * console.log(pkg.description) // "The reference implementation of the Linux FUSE ..."
 * console.log(pkg.programs)    // ["fusermount3"]
 * console.log(pkg.versions[0]) // "3.18.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/libfuse/libfuse.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libfusePackage = {
  /**
   * The display name of this package.
   */
  name: 'fusermount3' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/libfuse/libfuse' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The reference implementation of the Linux FUSE (Filesystem in Userspace) interface' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libfuse/libfuse/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/libfuse/libfuse' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/libfuse/libfuse' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/libfuse/libfuse -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/libfuse/libfuse' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fusermount3',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'mesonbuild.com',
    'linux:gnu.org/gcc@14',
    'linux:gnu.org/gettext',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.18.1',
    '3.18.0',
    '3.17.4',
    '3.17.3',
    '3.17.2',
    '3.17.1',
    '2.9.9',
  ] as const,
  aliases: [] as const,
}

export type LibfusePackage = typeof libfusePackage
