/**
 * **libseccomp** - Interface to the Linux Kernel's syscall filtering mechanism
 *
 * @domain `github.com/seccomp/libseccomp`
 * @programs `scmp_sys_resolver`
 * @version `2.6.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/seccomp/libseccomp`
 * @buildDependencies `gnu.org/libtool`, `gnu.org/gperf` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomseccomplibseccomp
 * console.log(pkg.name)        // "libseccomp"
 * console.log(pkg.description) // "Interface to the Linux Kernel's syscall filteri..."
 * console.log(pkg.programs)    // ["scmp_sys_resolver"]
 * console.log(pkg.versions[0]) // "2.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/seccomp/libseccomp.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libseccompPackage = {
  /**
   * The display name of this package.
   */
  name: 'libseccomp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/seccomp/libseccomp' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Interface to the Linux Kernel\'s syscall filtering mechanism' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/seccomp/libseccomp/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/seccomp/libseccomp' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/seccomp/libseccomp' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/seccomp/libseccomp -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/seccomp/libseccomp' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'scmp_sys_resolver',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/libtool',
    'gnu.org/gperf',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.6.0',
    '2.5.6',
    '2.5.5',
  ] as const,
  aliases: [] as const,
}

export type LibseccompPackage = typeof libseccompPackage
